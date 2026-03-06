"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { qrCodesRef } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, MousePointerClick, Smartphone, Globe } from "lucide-react";

const DEMO_TIMELINE = [
  { name: 'Mon', scans: 400 },
  { name: 'Tue', scans: 300 },
  { name: 'Wed', scans: 550 },
  { name: 'Thu', scans: 450 },
  { name: 'Fri', scans: 700 },
  { name: 'Sat', scans: 850 },
  { name: 'Sun', scans: 600 },
];

const DEMO_DEVICES = [
  { name: 'iOS', value: 45 },
  { name: 'Android', value: 35 },
  { name: 'Desktop', value: 20 },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production we fetch real aggregation here.
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="animate-pulse flex items-center gap-2">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Engine</h1>
        <p className="text-muted-foreground mt-2">Deep insights into your QR performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { title: "Total Scans", value: "3,850", icon: MousePointerClick, color: "text-primary" },
          { title: "Unique Visitors", value: "1,240", icon: TrendingUp, color: "text-accent" },
          { title: "Top Device", value: "iOS Mobile", icon: Smartphone, color: "text-pink-500" },
          { title: "Top Location", value: "New York, US", icon: Globe, color: "text-blue-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Scan Timeline (Last 7 Days)</CardTitle>
            <CardDescription>Volume of QR engagements over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DEMO_TIMELINE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262633" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121218', borderColor: '#262633', borderRadius: '8px' }}
                  itemStyle={{ color: '#E5E7EB' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="scans" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  activeDot={{ r: 8, fill: '#6366F1', stroke: '#0B0B0F', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
             <CardTitle>Device Distribution</CardTitle>
             <CardDescription>Operating systems used by scanners.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_DEVICES} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#262633" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" tickLine={false} axisLine={false}/>
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" tickLine={false} axisLine={false} width={80}/>
                <Tooltip 
                  cursor={{fill: '#1A1A22'}} 
                  contentStyle={{ backgroundColor: '#121218', borderColor: '#262633', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#22C55E" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
