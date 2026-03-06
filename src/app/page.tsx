"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, QrCode, Activity, Link as LinkIcon, Lock, Sparkles, Paintbrush, ShieldCheck } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { PublicQRGenerator } from "@/components/PublicQRGenerator";
import { useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleDown = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="flex flex-col min-h-screen bg-[#050508] selection:bg-primary/30 text-foreground overflow-x-hidden" ref={containerRef}>
      <Navbar />
      
      <main className="flex-1">
        {/* ULTRA PREMIUM HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-32 overflow-hidden">
          
          {/* Deep immersive background grids and glows */}
          <div className="absolute inset-0 bg-[#050508] -z-20" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
          
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[150px] -z-10 mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[150px] -z-10 mix-blend-screen" />
          
          {/* Main content */}
          <motion.div 
            className="container mx-auto px-4 z-10 flex flex-col items-center text-center mt-12"
            style={{ opacity: opacityFade, scale: scaleDown }}
          >
            {/* Pill badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Scanova V3 is now live</span>
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-8xl lg:text-[100px] font-extrabold tracking-tighter mb-8 leading-[1.05] text-balance max-w-5xl"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              The era of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">static QR codes</span>
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/50 italic">is over.</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl leading-relaxed mx-auto font-medium text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              Create <strong className="text-white font-semibold">Dynamic</strong> gateways. Change destinations instantly, track every scan in real-time, and protect your links with passwords.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            >
              <Link href="/signup" className="w-full">
                <Button size="lg" className="w-full h-14 bg-white text-black hover:bg-neutral-200 text-lg rounded-xl shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all">
                  Start creating dynamically
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Interactive Public Generator embedded right below the fold */}
          <motion.div 
             className="w-full px-4 mt-24 z-20"
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          >
             <PublicQRGenerator />
          </motion.div>
          
        </section>

        {/* TRUE USP HIGHLIGHT SECTION */}
        <section className="py-32 relative bg-black">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 space-y-6">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                  Never reprint <br className="hidden md:block" />
                  <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">another code.</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl text-balance">
                  With <strong>Dynamic QR Codes</strong>, the underlying short-link never changes. You can route users to a menu today, and a signup form tomorrow. Update the destination infinitely without changing the printed graphic.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    "Change URLs on the fly instantly",
                    "Fix typos after printing materials",
                    "A/B test different landing pages using the same code"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-lg font-medium text-white/80">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Abstract Visual Representation of Dynamic linking */}
              <div className="flex-1 w-full max-w-lg relative aspect-square">
                 <div className="absolute inset-0 bg-gradient-to-br from-card/80 to-background border border-border/50 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col items-center justify-center p-8">
                    <div className="w-32 h-32 bg-white rounded-2xl p-2 mb-8 shadow-[0_0_50px_rgba(255,255,255,0.2)] relative z-10">
                       <QrCode className="w-full h-full text-black" />
                    </div>
                    {/* Animated laser lines representing routing */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 flex gap-8 w-[150%]">
                       <motion.div 
                          className="h-1 bg-primary rounded-full blur-[2px]"
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "100%", opacity: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                       />
                    </div>
                    <div className="flex justify-between w-full mt-12 px-8 text-center text-sm font-bold text-muted-foreground z-10">
                       <div className="bg-card px-4 py-2 border border-border/50 rounded-lg shadow-xl">Menu.pdf</div>
                       <div className="bg-primary/20 text-primary px-4 py-2 border border-primary/30 rounded-lg shadow-xl pulse">Promo.com</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID FEATURES SECTION */}
        <section id="features" className="py-32 bg-[#050508] relative">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-balance">The ultimate toolkit.</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                Everything you need to build intelligent digital experiences from physical touchpoints.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
              {/* Big Feature 1: Analytics */}
              <motion.div 
                className="md:col-span-2 row-span-1 rounded-3xl bg-card/40 border border-white/5 p-8 relative overflow-hidden group hover:bg-card/60 transition-colors"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Activity className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-3xl font-bold mb-4">Real-time Analytics</h3>
                <p className="text-lg text-muted-foreground max-w-sm">Detailed tracking of scans, locations, unique visitors, and device metrics as they happen.</p>
              </motion.div>

              {/* Smaller Feature 2 */}
              <motion.div 
                className="md:col-span-1 row-span-1 rounded-3xl bg-card/40 border border-white/5 p-8 relative overflow-hidden group hover:bg-card/60 transition-colors"
                 whileHover={{ scale: 1.02 }}
                 transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <LinkIcon className="w-10 h-10 text-accent mb-6" />
                <h3 className="text-2xl font-bold mb-4">Multi-Link Pages</h3>
                <p className="text-muted-foreground">Bundle multiple destinations into one beautiful, mobile-optimized landing page.</p>
              </motion.div>

              {/* Smaller Feature 3 */}
              <motion.div 
                className="md:col-span-1 row-span-1 rounded-3xl bg-card/40 border border-white/5 p-8 relative overflow-hidden group hover:bg-card/60 transition-colors"
                 whileHover={{ scale: 1.02 }}
                 transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Lock className="w-10 h-10 text-orange-500 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Secure Passwords</h3>
                <p className="text-muted-foreground">Protect sensitive files or exclusive events behind custom password gates.</p>
              </motion.div>

              {/* Big Feature 4: AI */}
              <motion.div 
                className="md:col-span-2 row-span-1 rounded-3xl bg-card/40 border border-white/5 p-8 relative overflow-hidden group hover:bg-card/60 transition-colors flex flex-col justify-end"
                 whileHover={{ scale: 1.01 }}
                 transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent" />
                <div className="relative z-10">
                  <Paintbrush className="w-10 h-10 text-pink-500 mb-4" />
                  <h3 className="text-3xl font-bold mb-2">Campaign Intelligence & AI</h3>
                  <p className="text-lg text-muted-foreground max-w-xl">Generate marketing strategies and optimize landing page copy automatically using the integrated Gemini AI engine.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-32 relative overflow-hidden border-t border-white/5">
           {/* Abstract mesh gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10 opacity-30" />
          
          <div className="container mx-auto px-4 text-center relative z-10 flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter text-balance max-w-4xl">Ready to upgrade?</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto font-medium text-balance leading-relaxed">
              Join the future of offline-to-online marketing. Build dynamic touchpoints today.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-16 px-12 text-xl font-semibold rounded-2xl bg-white text-black hover:bg-neutral-200 hover:scale-105 transition-all duration-300 shadow-[0_0_60px_rgba(255,255,255,0.15)]">
                Start your free account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 bg-[#020202]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
              <img src="/Scanova_logo.jpg" alt="Scanova Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-white">Scanova Inc.</span>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Platform</Link>
            <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-white transition-colors">Security</Link>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Scanova. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
