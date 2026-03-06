"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Crown, Search, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface UserRecord {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro";
  created_at: any;
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filtered, setFiltered] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserRecord));
        data.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
        setUsers(data);
        setFiltered(data);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        toast.error(`Failed to load users: ${err.message || "Unknown error"}`);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.email?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const togglePlan = async (uid: string, currentPlan: string) => {
    const newPlan = currentPlan === "pro" ? "free" : "pro";
    setToggling(uid);
    try {
      await updateDoc(doc(db, "users", uid), { plan: newPlan });
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, plan: newPlan as "free" | "pro" } : u));
      toast.success(`User plan updated to ${newPlan.toUpperCase()}`);
    } catch {
      toast.error("Failed to update plan.");
    } finally {
      setToggling(null);
    }
  };

  if (loading || !isAdmin) return null;

  const proCount = users.filter(u => u.plan === "pro").length;
  const freeCount = users.filter(u => u.plan === "free").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" /> Admin Panel
        </h1>
        <p className="text-muted-foreground mt-2">Manage user plans. Only visible to you.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Users className="w-4 h-4"/> Total Users</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-yellow-400">{proCount}</div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Crown className="w-4 h-4 text-yellow-400"/> Pro Users</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold">{freeCount}</div>
            <p className="text-sm text-muted-foreground mt-1">Free Users</p>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Click the badge to toggle plan between Free ↔ Pro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or UID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{u.name || "No Name"}</p>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    <p className="text-xs text-muted-foreground/60 font-mono mt-0.5 truncate">{u.id}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {u.created_at ? format(new Date(u.created_at.seconds * 1000), "MMM dd, yyyy") : "—"}
                    </span>
                    <Button
                      size="sm"
                      variant={u.plan === "pro" ? "default" : "outline"}
                      className={u.plan === "pro" 
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black gap-1.5 font-semibold" 
                        : "gap-1.5 text-muted-foreground"
                      }
                      onClick={() => togglePlan(u.id, u.plan)}
                      disabled={toggling === u.id}
                    >
                      {toggling === u.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Crown className="w-3 h-3" />
                      )}
                      {u.plan === "pro" ? "PRO" : "Free"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
