"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, increment, doc } from "firebase/firestore";
import { qrCodesRef, qrScansRef } from "@/lib/db";
import { db } from "@/lib/firebase";
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

        // Check Expiry First
        if (qr.expiry_date && qr.expiry_date.toDate() < new Date()) {
          router.replace("/expired");
          return;
        }

        // Check Password
        if (qr.password) {
          router.replace(`/protected/${code}`);
          return;
        }

        // 1. Record Real Analytics (Tracking true scans)
        try {
          // A real prod environment uses ip detection. We use basic UA for MVP.
          await addDoc(qrScansRef, {
            qr_id: qr.id,
            user_id: qr.user_id, // For global dashboard aggregation
            timestamp: serverTimestamp(),
            device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
            browser: navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Safari") ? "Safari" : navigator.userAgent.includes("Firefox") ? "Firefox" : "Other",
            os: navigator.userAgent.includes("Win") ? "Windows" : navigator.userAgent.includes("Mac") ? "MacOS" : navigator.userAgent.includes("Linux") ? "Linux" : "Other",
            country: "Unknown", 
          });
          
          // Atomically increment the total scan count on the main document
          await updateDoc(doc(db, "qr_codes", qr.id), {
             scan_count: increment(1)
          });
        } catch (e) {
          console.error("Failed to log scan", e);
        }

        // 2. Headless Instant Redirect
        if (qr.type === "multi") {
          router.replace(`/smart/${code}`);
        } else if (qr.destination_url) {
          // Hard replace the window location for true redirect speed
          window.location.replace(qr.destination_url);
        } else {
          setError("Invalid destination URL detected.");
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

  // Purely headless, minimal empty layout so it visually jumps instantly
  return <div className="min-h-screen bg-transparent" />;
}
