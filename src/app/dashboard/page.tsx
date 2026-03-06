"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, MousePointerClick, TrendingUp, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { query, where, getDocs } from "firebase/firestore";
import { qrCodesRef } from "@/lib/db";
import Link from "next/link";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalQRs: 0, totalScans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      try {
        const q = query(qrCodesRef, where("user_id", "==", user.uid));
        const snapshots = await getDocs(q);
        let totalScans = 0;
        snapshots.forEach((doc) => {
          totalScans += doc.data().scan_count || 0;
        });
        setStats({
          totalQRs: snapshots.size,
          totalScans,
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.displayName || user?.email?.split("@")[0] || "User"}. Here's what's happening with your QRs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total QR Codes</CardTitle>
            <QrCode className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.totalQRs}</div>
            <p className="text-xs text-muted-foreground mt-1">Active dynamic gateways</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
            <MousePointerClick className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.totalScans}</div>
            <p className="text-xs text-muted-foreground mt-1">Real tracked engagements</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Scans / QR</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading || stats.totalQRs === 0 ? "0" : (stats.totalScans / stats.totalQRs).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Performance per code</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/dashboard/create">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center">
                <QrCode className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold">Create QR</p>
                  <p className="text-xs text-muted-foreground">New dynamic gateway</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/analytics">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center">
                <BarChart3 className="w-8 h-8 text-accent" />
                <div>
                  <p className="font-semibold">View Analytics</p>
                  <p className="text-xs text-muted-foreground">Scan insights & charts</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/campaigns">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-pink-500/50 transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center">
                <TrendingUp className="w-8 h-8 text-pink-500" />
                <div>
                  <p className="font-semibold">AI Campaigns</p>
                  <p className="text-xs text-muted-foreground">Generate strategies</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
