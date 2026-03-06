"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;    // Feature name shown in the lock overlay
  className?: string;
}

/**
 * Wraps any UI element. If user is on Free plan, renders a locked overlay.
 * If user is Pro, renders children normally.
 */
export function ProGate({ children, feature = "Pro Feature", className }: ProGateProps) {
  const { isPro } = useAuth();

  if (isPro) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      {/* Blurred out content */}
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl border border-primary/20 z-10">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-sm font-semibold">{feature}</p>
          <p className="text-xs text-muted-foreground">Upgrade to Pro to unlock</p>
          <Link href="/dashboard/settings">
            <Button size="sm" className="mt-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold gap-1.5 h-7 text-xs">
              <Crown className="w-3 h-3" /> Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline badge that shows Pro status in the sidebar or settings.
 */
export function PlanBadge() {
  const { isPro } = useAuth();
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
      isPro
        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
        : "bg-muted text-muted-foreground border border-border"
    )}>
      {isPro ? <Crown className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
      {isPro ? "PRO" : "FREE"}
    </span>
  );
}
