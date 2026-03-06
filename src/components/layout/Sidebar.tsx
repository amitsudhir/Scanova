"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, QrCode, Menu, X } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const NavLinks = () => (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
            {item.title}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm hidden md:flex flex-col h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
              <img src="/Scanova_logo.jpg" alt="Scanova Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl">Scanova</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-border shrink-0">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground gap-3 px-3 rounded-xl"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden">
            <img src="/Scanova_logo.jpg" alt="Scanova" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-lg">Scanova</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* ─── Mobile Drawer Overlay ─── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Mobile Drawer Panel ─── */}
      <div className={cn(
        "md:hidden fixed top-14 left-0 bottom-0 z-50 w-72 bg-background border-r border-border flex flex-col transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex-1 py-4 px-4 flex flex-col gap-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground gap-3 px-3 rounded-xl"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </Button>
        </div>
      </div>
    </>
  );
}
