"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { query, where, getDocs } from "firebase/firestore";
import { qrCodesRef } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

export default function ProtectedPage() {
  const params = useParams();
  const router = useRouter();
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const code = params.code as string;
      const q = query(qrCodesRef, where("short_code", "==", code));
      const snaps = await getDocs(q);

      if (snaps.empty) {
        toast.error("QR not found");
        return;
      }

      const qr = snaps.docs[0].data();

      // IMPORTANT: In a production V2 this should be validated server-side.
      if (qr.password === passwordInput) {
        toast.success("Access Granted");
        // Redirect to true destination
        if (qr.type === "multi") {
          router.replace(`/smart/${code}`);
        } else {
          window.location.href = qr.destination_url;
        }
      } else {
        toast.error("Incorrect Password");
      }
    } catch (err) {
      toast.error("Error unlocking link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <form onSubmit={handleUnlock}>
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Protected Content</CardTitle>
              <CardDescription className="mt-2">This destination requires a password to view.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
             <Input 
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="text-center text-lg bg-background"
             />
          </CardContent>
          <CardFooter>
             <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
               {loading ? "Verifying..." : "Unlock Access"}
             </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
