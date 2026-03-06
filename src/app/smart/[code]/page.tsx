"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { query, where, getDocs } from "firebase/firestore";
import { qrCodesRef, qrLinksRef } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Link as LinkIcon } from "lucide-react";

export default function SmartLandingPage() {
  const params = useParams();
  const [qr, setQr] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const code = params.code as string;
        // Get QR
        const qQ = query(qrCodesRef, where("short_code", "==", code));
        const qrSnaps = await getDocs(qQ);
        if (qrSnaps.empty) {
          setError("Page not found.");
          return;
        }
        
        const qrData = { id: qrSnaps.docs[0].id, ...qrSnaps.docs[0].data() } as any;
        setQr(qrData);

        // Get Links
        const qL = query(qrLinksRef, where("qr_id", "==", qrData.id));
        const lSnaps = await getDocs(qL);
        const lData = lSnaps.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort explicitly if order exists
        lData.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setLinks(lData);

      } catch (err) {
        console.error(err);
        setError("Failed to load page.");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [params.code]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 flex border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (error || !qr) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center select-none text-muted-foreground">
        <QrCode className="w-16 h-16 opacity-20 mb-4" />
        <h1 className="text-xl font-bold">{error || "Page Not Found"}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-16 px-4">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/20 to-transparent -z-10" />

      <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
        
        {/* Profile / Header */}
        <div className="text-center space-y-4">
           <div className="w-24 h-24 rounded-full bg-card border-4 border-background mx-auto shadow-xl flex items-center justify-center overflow-hidden">
             {/* Stub profile image */}
             <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                 <QrCode className="w-10 h-10 text-white" />
             </div>
           </div>
           <h1 className="text-2xl font-bold tracking-tight">{qr.title}</h1>
           <p className="text-muted-foreground text-sm">Powered by Scanova</p>
        </div>

        {/* Links List */}
        <div className="space-y-4">
          {links.map((link) => (
            <a 
              key={link.id} 
              href={link.url.startsWith("http") ? link.url : `https://${link.url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Card className="bg-card/60 backdrop-blur-md border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-primary/20 transition-all overflow-hidden group">
                <CardContent className="p-0 flex items-center h-16">
                  {/* Icon Area */}
                  <div className="w-16 h-full flex items-center justify-center bg-background/50 group-hover:bg-primary/10 transition-colors">
                    <LinkIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {/* Text Area */}
                  <div className="flex-1 px-4 font-semibold shrink-0 truncate">
                    {link.title}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
