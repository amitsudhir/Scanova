"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, MousePointerClick, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db, qrCodesRef } from "@/lib/db";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalQRs: 0, totalScans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // In a real app we would aggregate scans from `qr_scans` table and total QRs.
    // For MVP frontend stub, we'll fetch actual total QRs and mock total scans.
    const fetchStats = async () => {
      try {
        const q = query(qrCodesRef, where("user_id", "==", user.uid));
        const snapshots = await getDocs(q);
        setStats({
          totalQRs: snapshots.size,
          // Mock scans until analytics endpoints are complete
          totalScans: snapshots.size * 42 
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
        <p className="text-muted-foreground mt-2">Welcome back, {user?.displayName || "User"}. Here's what's happening with your QRs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total QR Codes</CardTitle>
            <QrCode className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.totalQRs}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
            <MousePointerClick className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.totalScans}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+14.2%</div>
            <p className="text-xs text-muted-foreground mt-1">from last month</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Placeholder for Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight mb-4">Recent Activity</h2>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <BarChart3 className="w-10 h-10 mb-4 opacity-50" />
            <p>Scan timeline chart will go here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Ensure BarChart3 icon is imported for the placeholder
import { BarChart3 } from "lucide-react";
