"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { QrCode, LayoutDashboard, BarChart3, Settings, Sparkles, Shield } from "lucide-react";

const baseNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My QRs", href: "/dashboard/qrs", icon: QrCode },
  { title: "Create QR", href: "/dashboard/create", icon: QrCode },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Campaign AI", href: "/dashboard/campaigns", icon: Sparkles },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNavItem = { title: "Admin Panel", href: "/dashboard/admin", icon: Shield };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar items={navItems} />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto pt-20 md:pt-8">
        {children}
      </main>
    </div>
  );
}
