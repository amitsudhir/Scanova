"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrCode, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const QRPreview = dynamic(() => import("./QRDesigner").then(mod => mod.QRPreview), { 
  ssr: false,
  loading: () => <div className="w-[160px] h-[160px] bg-muted/20 animate-pulse rounded-2xl" />
});

export function PublicQRGenerator() {
  const [url, setUrl] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsGenerating(true);
    // Simulate slight delay for premium feel
    setTimeout(() => {
      setGeneratedUrl(url);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-xl mx-auto backdrop-blur-2xl bg-card/40 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 group-hover:bg-primary/30 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -z-10 group-hover:bg-accent/20 transition-colors duration-700" />

      <h3 className="text-2xl font-semibold mb-2 tracking-tight">Generate instantly.</h3>
      <p className="text-muted-foreground mb-8">No sign up required for static QRs. Just paste and go.</p>

      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://your-website.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-14 bg-background/50 border-white/10 text-lg rounded-xl focus-visible:ring-primary/50 placeholder:text-muted-foreground/50 transition-all"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={isGenerating || !url} 
            className="w-full h-14 rounded-xl text-md font-medium shrink-0 bg-white text-black hover:bg-neutral-200 transition-all shadow-lg shadow-white/10"
          >
            {isGenerating ? "Generating..." : "Create static QR code"}
          </Button>

          <Link href="/signup" className="block mt-4 text-sm text-center text-muted-foreground hover:text-white transition-colors group/link mt-6">
            Want <span className="text-primary font-medium">Dynamic</span> tracked links instead? 
            <span className="inline-flex items-center ml-1 group-hover/link:translate-x-1 transition-transform">
              Sign up free <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </Link>
        </form>

        <div className="flex justify-center md:justify-end">
           <AnimatePresence mode="wait">
             {generatedUrl ? (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md"
                >
                  <QRPreview 
                    value={generatedUrl} 
                    size={160}
                    design={{
                      fgColor: "#6366F1", // Primary theme color
                      bgColor: "#FFFFFF",
                      dotType: "rounded",
                      cornerType: "extra-rounded"
                    }}
                  />
                </motion.div>
             ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  className="w-[192px] h-[192px] rounded-2xl border border-dashed border-white/20 bg-background/30 flex flex-col items-center justify-center text-muted-foreground"
                >
                  <QrCode className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-xs font-medium">Ready when you are</span>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
