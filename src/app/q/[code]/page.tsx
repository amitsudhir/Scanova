"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { qrCodesRef, qrScansRef } from "@/lib/db";
import { QrCode } from "lucide-react";

export default function QRRedirectEngine() {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.code as string;
    if (!code) return;

    const processQR = async () => {
      try {
        const q = query(qrCodesRef, where("short_code", "==", code));
        const snapshots = await getDocs(q);
        
        if (snapshots.empty) {
          setError("QR code not found or inactive.");
          return;
        }

        const qrDoc = snapshots.docs[0];
        const qr = { id: qrDoc.id, ...qrDoc.data() } as any;

        if (!qr.is_active) {
          setError("This QR code is no longer active.");
          return;
        }

        // 1. Record Analytics
        // In a real prod environment this would be done on a secure backend Route endpoint,
        // using headers to get real IP and User-Agent.
        try {
          await addDoc(qrScansRef, {
            qr_id: qr.id,
            timestamp: serverTimestamp(),
            device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
            browser: "Chrome", // Simplified for MVP
            os: "Windows", // Simplified for MVP
            country: "Unknown", // Needs external API
          });
        } catch (e) {
          console.error("Failed to log scan", e);
        }

        // 2. Check Expiry
        if (qr.expiry_date && qr.expiry_date.toDate() < new Date()) {
          router.replace("/expired");
          return;
        }

        // 3. Check Password
        if (qr.password) {
          // Pass the QR ID in URL or use session state. 
          // For MVP, router push to protected route with the shortcode
          router.replace(`/protected/${code}`);
          return;
        }

        // 4. Final Redirect based on Type
        if (qr.type === "multi") {
          router.replace(`/smart/${code}`);
        } else {
          // Prevent open redirect vulnerabilites basic check
          if (qr.destination_url.startsWith("http")) {
             window.location.href = qr.destination_url;
          } else {
             setError("Invalid destination URL detected.");
          }
        }

      } catch (err) {
        console.error(err);
        setError("A system error occurred while processing this code.");
      }
    };

    processQR();
  }, [params.code, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
           <QrCode className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Scan Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Loading state while evaluating rules
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <QrCode className="w-6 h-6 text-primary animate-pulse" />
        </div>
      </div>
      <p className="mt-6 text-muted-foreground animate-pulse">Routing intelligently...</p>
    </div>
  );
}
