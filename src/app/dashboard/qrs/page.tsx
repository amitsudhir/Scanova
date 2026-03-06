"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { qrCodesRef } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ExternalLink, Activity, Clock, Lock, LayoutTemplate, Trash2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { QRDisplay } from "@/components/QRDisplay";
import dynamic from "next/dynamic";

const QRPreview = dynamic(() => import("@/components/QRDesigner").then(mod => mod.QRPreview), { 
  ssr: false,
  loading: () => <div className="w-20 h-20 bg-muted/20 animate-pulse rounded-lg" />
});
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function MyQRsPage() {
  const { user } = useAuth();
  const [qrs, setQrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrToDelete, setQrToDelete] = useState<any>(null);

  const handleDelete = async () => {
    if (!qrToDelete) return;
    try {
      await deleteDoc(doc(db, "qr_codes", qrToDelete.id));
      setQrs(qrs.filter(q => q.id !== qrToDelete.id));
      toast.success("QR Code deleted successfully");
    } catch (error) {
      console.error("Error deleting QR code", error);
      toast.error("Failed to delete QR code");
    } finally {
      setQrToDelete(null);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    const fetchQRs = async () => {
      try {
        const q = query(
          qrCodesRef, 
          where("user_id", "==", user.uid)
        );
        const snapshots = await getDocs(q);
        const fetchedQrs = snapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory to avoid needing a Firestore composite index
        fetchedQrs.sort((a: any, b: any) => {
          const dateA = a.created_at?.toDate?.()?.getTime() || 0;
          const dateB = b.created_at?.toDate?.()?.getTime() || 0;
          return dateB - dateA;
        });
        setQrs(fetchedQrs);
      } catch (error) {
        console.error("Failed to fetch QRs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQRs();
  }, [user]);

  if (loading) {
    return <div className="text-muted-foreground flex items-center gap-2"><div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" /> Loading QR codes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My QR Codes</h1>
          <p className="text-muted-foreground mt-2">Manage your intelligent digital gateways.</p>
        </div>
        <Link href="/dashboard/create">
          <Button className="gap-2">
            <QrCode className="w-4 h-4" /> Create New
          </Button>
        </Link>
      </div>

      {qrs.length === 0 ? (
        <Card className="bg-card/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <QrCode className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No QR codes yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">Create your first intelligent QR code to start tracking scans and managing redirects.</p>
             <Link href="/dashboard/create">
                <Button>Create Your First QR</Button>
             </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {qrs.map((qr) => (
            <Card key={qr.id} className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors group cursor-pointer">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg truncate max-w-[200px]">{qr.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                       {qr.created_at ? format(qr.created_at.toDate(), "MMM dd, yyyy") : "Just now"}
                    </CardDescription>
                  </div>
                  <div className="shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                     <QRPreview 
                       value={typeof window !== 'undefined' ? `${window.location.origin}/q/${qr.short_code}` : `https://scanova.com/q/${qr.short_code}`} 
                       size={80}
                       design={{
                         fgColor: qr.fg_color || "#000000",
                         bgColor: qr.bg_color || "#FFFFFF",
                         dotType: qr.dot_type || "square",
                         cornerType: qr.corner_type || "square",
                         logoDataUrl: qr.logo_data_url || undefined
                       }}
                     />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   {qr.type === 'single' ? <ExternalLink className="w-4 h-4" /> : <LayoutTemplate className="w-4 h-4 text-accent" />}
                   <span className="truncate">{qr.type === 'single' ? qr.destination_url : "Smart Landing Page"}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {qr.password && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20">
                      <Lock className="w-3 h-3" /> Password Protected
                    </span>
                  )}
                  {qr.expiry_date && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                      <Clock className="w-3 h-3" /> Expires {format(qr.expiry_date.toDate(), "MMM dd")}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between items-center">
                 <div className="flex items-center gap-2 text-primary font-medium text-sm">
                   <Activity className="w-4 h-4" />
                   <span>{qr.scan_count || 0} scans</span>
                 </div>
                 <div className="flex gap-2">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     title="Copy Link"
                     className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                     onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(typeof window !== 'undefined' ? `${window.location.origin}/q/${qr.short_code}` : `https://scanova.com/q/${qr.short_code}`);
                        toast.success("Link copied to clipboard");
                     }}
                   >
                     <Copy className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                      <Link href={`/dashboard/edit/${qr.id}`}>Manage</Link>
                   </Button>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                     onClick={(e) => {
                       e.stopPropagation();
                       setQrToDelete(qr);
                     }}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Custom Deletion Popup Dialog */}
      <Dialog open={!!qrToDelete} onOpenChange={(open) => !open && setQrToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Delete QR Code</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete &quot;{qrToDelete?.title}&quot;? 
              This will instantly break all printed versions of this QR code. Anyone analyzing it will see a 404 error. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setQrToDelete(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Yes, Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
