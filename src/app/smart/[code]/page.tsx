"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { query, where, getDocs } from "firebase/firestore";
import { qrCodesRef, qrLinksRef } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Link as LinkIcon, Share2 } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen flex flex-col items-center py-16 px-4 relative overflow-hidden text-foreground"
         style={{ backgroundColor: qr.bg_color || "#0B0B0F" }}>
      
      {/* Immersive Blur Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: qr.fg_color || "#6366F1" }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: qr.fg_color || "#6366F1" }}
        />
      </div>
      
      <div className="w-full max-w-sm space-y-8 z-10">
        
        {/* Profile / Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
           <div className="w-24 h-24 rounded-3xl mx-auto shadow-2xl flex items-center justify-center overflow-hidden border border-white/10 p-0.5"
                style={{ backgroundColor: qr.fg_color || "#FFFFFF" }}>
              <div className="w-full h-full rounded-[1.4rem] bg-background flex items-center justify-center overflow-hidden">
                {qr.logo_data_url ? (
                  <img src={qr.logo_data_url} alt="logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${qr.fg_color}44, ${qr.fg_color}22)` }}>
                    <QrCode className="w-10 h-10" style={{ color: qr.fg_color }} />
                  </div>
                )}
              </div>
           </div>
           <div>
             <h1 className="text-2xl font-bold tracking-tight">{qr.title}</h1>
             <p className="text-muted-foreground text-sm opacity-70">Digital gateway by Scanova</p>
           </div>
        </motion.div>

        {/* Links List */}
        <div className="space-y-3">
          {links.map((link, i) => (
            <motion.a 
              key={link.id} 
              href={link.url.startsWith("http") ? link.url : `https://${link.url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="block group"
            >
              <div className="relative overflow-hidden rounded-2xl p-px transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/20">
                {/* Animated gradient border on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-50" />
                
                <div className="relative bg-card/40 backdrop-blur-xl rounded-[calc(1rem-1px)] flex items-center h-16 border border-white/5 transition-colors group-hover:bg-card/60">
                  {/* Icon Area */}
                  <div className="w-16 h-full flex items-center justify-center border-r border-white/5 bg-white/5 group-hover:bg-white/10 transition-colors">
                    <LinkIcon className="w-5 h-5 transition-transform group-hover:rotate-12" style={{ color: qr.fg_color }} />
                  </div>
                  {/* Text Area */}
                  <div className="flex-1 px-5 font-bold truncate">
                    {link.title}
                  </div>
                  <div className="pr-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-12 text-center"
        >
          <Link href="/">
            <Button variant="ghost" className="text-xs text-muted-foreground hover:text-foreground gap-2 rounded-full px-6">
              <QrCode className="w-3.5 h-3.5" /> Made with Scanova
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
