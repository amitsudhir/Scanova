import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden p-4 text-center">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
      
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <QrCode className="w-10 h-10 text-primary opacity-60" />
        </div>
      </div>

      <h1 className="text-7xl font-black text-primary/40 tracking-tight mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex gap-3">
        <Link href="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
