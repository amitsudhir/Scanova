"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, query, where, getDocs, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { qrCodesRef, qrLinksRef } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { QrCode, Link as LinkIcon, Lock, Clock, Navigation, Plus, Trash2, LayoutTemplate } from "lucide-react";
import { QRDisplay } from "@/components/QRDisplay";
import { format } from "date-fns";

export default function EditQRPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Core
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"single" | "multi">("single");
  const [destination, setDestination] = useState("");
  const [shortCode, setShortCode] = useState("");
  
  // Multi-links
  const [links, setLinks] = useState([{ title: "", url: "" }]);

  // Advanced
  const [password, setPassword] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [contextRules, setContextRules] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const fetchQRData = async () => {
      try {
        const docRef = doc(db, "qr_codes", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().user_id !== user.uid) {
          toast.error("QR Code not found or access denied.");
          router.push("/dashboard/qrs");
          return;
        }

        const data = docSnap.data() as any;
        setTitle(data.title || "");
        setType(data.type || "single");
        setDestination(data.destination_url || "");
        setShortCode(data.short_code);
        setPassword(data.password || "");
        setIsActive(data.is_active ?? true);
        
        if (data.expiry_date) {
          // Format date for datetime-local input
          const d = data.expiry_date.toDate();
          const tzoffset = (new Date()).getTimezoneOffset() * 60000;
          const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0,16);
          setExpiryDate(localISOTime);
        }

        if (data.type === "multi") {
          const linksQ = query(qrLinksRef, where("qr_id", "==", id));
          const linksSnap = await getDocs(linksQ);
          const fetchedLinks: any[] = [];
          linksSnap.forEach((d) => {
            fetchedLinks.push(d.data());
          });
          fetchedLinks.sort((a, b) => a.order - b.order);
          if (fetchedLinks.length > 0) {
            setLinks(fetchedLinks);
          }
        }
      } catch (err) {
        console.error("Error fetching QR data", err);
        toast.error("Failed to load QR details.");
      } finally {
        setFetching(false);
      }
    };

    fetchQRData();
  }, [id, user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    
    setLoading(true);

    try {
      const docRef = doc(db, "qr_codes", id);
      const updateData = {
        title,
        type,
        destination_url: type === "single" ? destination : null,
        password: password || null,
        expiry_date: expiryDate ? new Date(expiryDate) : null,
        is_active: isActive
      };

      await updateDoc(docRef, updateData);

      // Save Multi-links (Delete existing, then recreate to handle order/deletions easily)
      if (type === "multi") {
        const existingLinksQ = query(qrLinksRef, where("qr_id", "==", id));
        const existingDocs = await getDocs(existingLinksQ);
        const deletePromises = existingDocs.docs.map((d) => deleteDoc(doc(db, "qr_links", d.id)));
        await Promise.all(deletePromises);

        for (let i = 0; i < links.length; i++) {
          if (links[i].url && links[i].title) {
            await addDoc(qrLinksRef, {
              qr_id: id,
              title: links[i].title,
              url: links[i].url,
              icon: "globe",
              order: i
            });
          }
        }
      }

      toast.success("QR Code updated successfully!");
      router.push("/dashboard/qrs");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to update QR Code");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground gap-2">
         <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
         Loading QR Settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit QR Code</h1>
          <p className="text-muted-foreground mt-2">Update destination, rules, or security for this dynamic gateway.</p>
        </div>
      </div>

      <form onSubmit={handleUpdate}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Config Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Basic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>QR Code Title</Label>
                  <Input 
                    placeholder="e.g. Summer Menu 2024" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">Internal name to identify this QR.</p>
                </div>

                <div className="pt-4">
                  <Label className="mb-3 block">QR Type</Label>
                  <Tabs value={type} onValueChange={(v) => setType(v as "single" | "multi")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-background/50">
                      <TabsTrigger value="single" className="gap-2"><LinkIcon className="w-4 h-4"/> Direct Redirect</TabsTrigger>
                      <TabsTrigger value="multi" className="gap-2"><LayoutTemplate className="w-4 h-4"/> Smart Landing Page</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="single" className="pt-4 space-y-2">
                      <Label>Destination URL</Label>
                      <Input 
                        placeholder="https://example.com" 
                        type="url" 
                        value={destination} 
                        onChange={e => setDestination(e.target.value)}
                        required={type === "single"}
                        className="bg-background/50"
                      />
                    </TabsContent>
                    
                    <TabsContent value="multi" className="pt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Link List</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setLinks([...links, {title: '', url: ''}])}>
                          <Plus className="w-4 h-4 mr-1" /> Add Link
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {links.map((link, idx) => (
                          <div key={idx} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <Input placeholder="Link Title (e.g. Instagram)" value={link.title} onChange={e => {
                                const newLinks = [...links]; newLinks[idx].title = e.target.value; setLinks(newLinks);
                              }} required={type === "multi"} className="bg-background/50" />
                              <Input placeholder="https://..." type="url" value={link.url} onChange={e => {
                                const newLinks = [...links]; newLinks[idx].url = e.target.value; setLinks(newLinks);
                              }} required={type === "multi"} className="bg-background/50" />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive mt-1 hover:bg-destructive/10"
                              onClick={() => {
                                if (links.length > 1) {
                                  const newLinks = [...links]; newLinks.splice(idx, 1); setLinks(newLinks);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex justify-between items-center mb-1">
                  <CardTitle className="flex items-center gap-2"><Lock className="w-4 h-4 text-orange-500" /> Security & Expiration</CardTitle>
                </div>
                <CardDescription>Optional protections for your links.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                   <div>
                     <Label className="text-md">Active Status</Label>
                     <p className="text-xs text-muted-foreground font-normal">If disabled, scanning this QR will show an error screen instead of redirecting.</p>
                   </div>
                   <Switch 
                     checked={isActive} 
                     onCheckedChange={setIsActive} 
                     className="data-[state=checked]:bg-primary"
                   />
                </div>

                <div className="space-y-2 pt-2">
                  <Label>Password Protection</Label>
                  <Input 
                    type="password"
                    placeholder="Leave blank for public access" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-background/50 w-full sm:w-1/2"
                  />
                  <p className="text-xs text-muted-foreground">Users must enter this to reach destination.</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Expiration Date & Time</Label>
                  <Input 
                    type="datetime-local" 
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="bg-background/50 w-full sm:w-1/2"
                  />
                  <p className="text-xs text-muted-foreground">Link will fail to resolve after this time.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Config & Submit */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Preview Action</CardTitle>
                <CardDescription>Shortcode: <span className="text-primary font-mono bg-primary/10 px-1 rounded">{shortCode}</span></CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <div className="relative group">
                  <QRDisplay 
                    value={typeof window !== 'undefined' ? `${window.location.origin}/q/${shortCode}` : `https://scanova.com/q/${shortCode}`} 
                    title={title || "Preview"} 
                    showDownload={true} 
                    size={160} 
                  />
                </div>
              </CardContent>
              <CardFooter>
                 <Button type="submit" size="lg" className="w-full text-md h-12" disabled={loading}>
                   {loading ? "Updating..." : "Save Changes"}
                 </Button>
              </CardFooter>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 opacity-70">
              <CardHeader>
                <div className="flex justify-between items-center mb-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-accent" /> Context Routing
                  </CardTitle>
                  <Switch 
                     checked={contextRules} 
                     onCheckedChange={setContextRules} 
                     className="data-[state=checked]:bg-accent"
                  />
                </div>
                <CardDescription>Advanced route mapping based on device OS or location.</CardDescription>
              </CardHeader>
              {contextRules && (
                <CardContent>
                  <p className="text-xs text-muted-foreground text-center p-4 bg-background/50 rounded border border-dashed">
                    Rule builder will be active in final version. <br/> (Mocked for UI preview)
                  </p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
