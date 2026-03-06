import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory store for MVP rate limiting
// In production, use Redis (e.g., Upstash) for distributed rate limiting.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  // Only apply rate limiting to QR scan redirects
  if (request.nextUrl.pathname.startsWith('/q/')) {
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 30; // 30 scans per minute per IP

    const record = rateLimitMap.get(ip);
    
    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      record.count += 1;
      if (record.count > maxRequests) {
        return new NextResponse("Too Many Requests. Rate limit exceeded.", { status: 429 });
      }
    }
  }

  // Set context headers for Context-Aware redirects (used by /q/[code] engine)
  const response = NextResponse.next();
  // We'll fallback to an unknown country for standard middleware unless provided by a proxy header
  const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
  response.headers.set('x-user-country', country);
  
  return response;
}

export const config = {
  matcher: ['/q/:path*'],
};

