"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { qrCodesRef, qrLinksRef } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { QrCode, Link as LinkIcon, Lock, Clock, Navigation, Plus, Trash2, LayoutTemplate, Crown } from "lucide-react";
import { QRDisplay } from "@/components/QRDisplay";
import { ProGate } from "@/components/ProGate";

export default function CreateQRPage() {
  const { user, isPro } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Core
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"single" | "multi">("single");
  const [destination, setDestination] = useState("");
  
  // Multi-links
  const [links, setLinks] = useState([{ title: "", url: "" }]);

  // Advanced
  const [password, setPassword] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [contextRules, setContextRules] = useState(false);

  // QR Design
  const [fgColor, setFgColor] = useState("#0B0B0F");
  const [bgColor, setBgColor] = useState("#FFFFFF");

  // Generate shortcode
  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    const shortCode = generateShortCode();

    try {
      // 1. Save QR Code Record
      const qrData = {
        user_id: user.uid,
        short_code: shortCode,
        title,
        type,
        destination_url: type === "single" ? destination : null,
        password: password || null,
        expiry_date: expiryDate ? new Date(expiryDate) : null,
        is_active: true,
        fg_color: fgColor,
        bg_color: bgColor,
        scan_count: 0,
        created_at: serverTimestamp()
      };

      const qrRef = await addDoc(qrCodesRef, qrData);

      // 2. Save Multi-links if applicable
      if (type === "multi") {
        for (let i = 0; i < links.length; i++) {
          if (links[i].url && links[i].title) {
            await addDoc(qrLinksRef, {
              qr_id: qrRef.id,
              title: links[i].title,
              url: links[i].url,
              icon: "globe",
              order: i
            });
          }
        }
      }

      toast.success("QR Code created successfully!");
      router.push("/dashboard/qrs");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to create QR Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create QR Code</h1>
        <p className="text-muted-foreground mt-2">Configure dynamic rules, landing pages, and security settings.</p>
      </div>

      <form onSubmit={handleCreate}>
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
                      <TabsTrigger value="multi" className="gap-2" disabled={!isPro}>
                        <LayoutTemplate className="w-4 h-4"/> Smart Landing Page
                        {!isPro && <Crown className="w-3 h-3 text-yellow-400 ml-1" />}
                      </TabsTrigger>
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

            <ProGate feature="Password & Expiry Protection" className="rounded-xl">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="w-4 h-4 text-orange-500" /> Security &amp; Expiration</CardTitle>
                  <CardDescription>Optional protections for your links.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Password Protection</Label>
                    <Input 
                      type="password"
                      placeholder="Leave blank for public access" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={!isPro}
                      className="bg-background/50 w-full sm:w-1/2"
                    />
                    <p className="text-xs text-muted-foreground">Users must enter this to reach destination.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Expiration Date &amp; Time</Label>
                    <Input 
                      type="datetime-local" 
                      value={expiryDate}
                      onChange={e => setExpiryDate(e.target.value)}
                      disabled={!isPro}
                      className="bg-background/50 w-full sm:w-1/2"
                    />
                    <p className="text-xs text-muted-foreground">Link will fail to resolve after this time.</p>
                  </div>
                </CardContent>
              </Card>
            </ProGate>
          </div>

          {/* Sidebar Config & Submit */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Preview Action</CardTitle>
                <CardDescription>Your QR code is generated instantly upon saving.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-2">
                <div className="flex justify-center py-2">
                  <QRDisplay 
                    value={typeof window !== 'undefined' ? `${window.location.origin}/q/preview` : `https://scanova.com/q/preview`} 
                    title={title || "Preview"} 
                    showDownload={false} 
                    size={150}
                    fgColor={fgColor}
                    bgColor={bgColor}
                  />
                </div>
                {/* Color Pickers */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">QR Color</label>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/50">
                      <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                      <span className="text-xs font-mono text-muted-foreground">{fgColor}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Background</label>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/50">
                      <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                      <span className="text-xs font-mono text-muted-foreground">{bgColor}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button type="submit" size="lg" className="w-full text-md h-12" disabled={loading}>
                   {loading ? "Creating..." : "Save & Generate QR"}
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
