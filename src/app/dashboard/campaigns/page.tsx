"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Palette, PenTool, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { generateCampaignStrategy } from "@/app/actions/ai";

export default function AICampaignsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<{strategy: string, cta: string} | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await generateCampaignStrategy(goal);
      setResult(res);
      toast.success("AI generated campaign ideas!");
    } catch (err) {
      toast.error("Failed to generate AI strategy. Check API keys.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaign Intelligence</h1>
        <p className="text-muted-foreground mt-2">Use AI to generate strategies, landing pages, and custom designs.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Campaign Advisor */}
        <Card className="bg-card/40 backdrop-blur-sm border-primary/20 bg-gradient-to-br from-primary/5 to-transparent flex flex-col">
          <CardHeader>
             <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 text-primary">
                <Sparkles className="w-6 h-6" />
             </div>
             <CardTitle>AI Campaign Advisor</CardTitle>
             <CardDescription>Tell us your goal and let our AI suggest optimal QR placements and CTA strategies.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
             <form onSubmit={handleGenerate} className="space-y-4">
               <div className="space-y-2">
                 <Input 
                   placeholder="e.g. I run a coffee shop and want to increase reviews"
                   value={goal}
                   onChange={e => setGoal(e.target.value)}
                   className="bg-background/50 h-12"
                   disabled={loading}
                 />
               </div>
               <Button type="submit" disabled={!goal || loading} className="w-full">
                 {loading ? "Analyzing..." : "Generate Strategy"}
               </Button>
             </form>
             
             {result && (
               <div className="mt-8 p-4 rounded-xl bg-background/50 border border-primary/20 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                 <div>
                   <h4 className="font-semibold text-primary mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Recommended Strategy</h4>
                   <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                     {result.strategy}
                   </div>
                 </div>
                 <div className="pt-4 border-t border-border/50">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Generated CTA</h4>
                    <p className="font-medium text-lg">&quot;{result.cta}&quot;</p>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Design Generator */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 flex flex-col opacity-80 grayscale hover:grayscale-0 transition-all">
          <CardHeader>
             <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 text-pink-500">
                <Palette className="w-6 h-6" />
             </div>
             <CardTitle>AI QR Design Generator</CardTitle>
             <CardDescription>Transform boring QR codes into branded masterpieces using Stable Diffusion.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center space-y-4 py-8">
             <PenTool className="w-8 h-8 text-muted-foreground" />
             <div>
               <p className="font-medium">Coming Soon</p>
               <p className="text-sm text-muted-foreground">This feature requires a Pro subscription.</p>
             </div>
          </CardContent>
          <CardFooter>
             <Button variant="outline" className="w-full" disabled>Unlock Pro</Button>
          </CardFooter>
        </Card>

        {/* Landing Page Builder */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50 flex flex-col opacity-80 grayscale hover:grayscale-0 transition-all md:col-span-2">
           <CardHeader>
             <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                <LayoutTemplate className="w-6 h-6" />
             </div>
             <CardTitle>AI Landing Page Builder</CardTitle>
             <CardDescription>Instantly construct conversion-optimized smart pages just by typing your business name and links.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
              <Button variant="secondary" disabled>Currently in Beta Access</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
