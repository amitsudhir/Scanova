"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { QrCode, LayoutDashboard, BarChart3, Settings, Sparkles, LogOut } from "lucide-react";

const sidebarNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My QRs", href: "/dashboard/qrs", icon: QrCode },
  { title: "Create QR", href: "/dashboard/create", icon: QrCode },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Campaign AI", href: "/dashboard/campaigns", icon: Sparkles },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Protect route
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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar items={sidebarNavItems} />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
