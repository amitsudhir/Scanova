/**
 * Basic Phishing Detection Utility for MVP
 * Checks URLs against a known list of unsafe patterns.
 */

const SUSPICIOUS_DOMAINS = [
  "free-crypto-giveaway.net",
  "secure-login-update.com",
  "bank-verify-account.info"
];

const SUSPICIOUS_KEYWORDS = [
  "login-update",
  "free-money",
  "verify-account"
];

export function isUrlSafe(url: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    if (SUSPICIOUS_DOMAINS.includes(hostname)) {
      return { safe: false, reason: "Domain is flagged as suspicious." };
    }

    const hasSuspiciousKeyword = SUSPICIOUS_KEYWORDS.some(k => url.toLowerCase().includes(k));
    if (hasSuspiciousKeyword) {
       return { safe: false, reason: "URL contains suspicious keywords." };
    }

    return { safe: true };
  } catch (e) {
     return { safe: false, reason: "Invalid URL format." };
  }
}
