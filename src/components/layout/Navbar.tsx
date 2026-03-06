import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 w-full z-50 transition-all duration-300 bg-[#050508]/60 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center group-hover:from-white/30 transition-colors shadow-lg overflow-hidden">
            <img src="/Scanova_logo.jpg" alt="Scanova Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:inline-block">Scanova</span>
        </Link>
        
        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-5">
           <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors hidden sm:block">
             Sign in
           </Link>
           <Link href="/signup">
             <Button className="h-9 px-6 font-medium bg-white text-black hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-lg">
               Get Started
             </Button>
           </Link>
        </div>
        
      </div>
    </nav>
  );
}
