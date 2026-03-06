"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { query, where, getDocs, addDoc, serverTimestamp, updateDoc, increment, doc } from "firebase/firestore";
import { qrCodesRef, qrScansRef } from "@/lib/db";
import { db } from "@/lib/firebase";
import { AlertCircle, QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Detect device/browser from UA
function parseUserAgent(ua: string) {
  const device = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
  const browser = ua.includes("Chrome") && !ua.includes("Edg") ? "Chrome"
    : ua.includes("Safari") && !ua.includes("Chrome") ? "Safari"
    : ua.includes("Firefox") ? "Firefox"
    : ua.includes("Edg") ? "Edge"
    : "Other";
  const os = ua.includes("Win") ? "Windows"
    : ua.includes("iPhone") || ua.includes("iPad") ? "iOS"
    : ua.includes("Mac") ? "macOS"
    : ua.includes("Android") ? "Android"
    : ua.includes("Linux") ? "Linux"
    : "Other";
  return { device, browser, os };
}

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
          setError("This QR code doesn't exist or has been deleted.");
          return;
        }

        const qrDoc = snapshots.docs[0];
        const qr = { id: qrDoc.id, ...qrDoc.data() } as any;

        if (!qr.is_active) {
          setError("This QR code has been deactivated by its owner.");
          return;
        }

        if (qr.expiry_date && qr.expiry_date.toDate() < new Date()) {
          router.replace("/expired");
          return;
        }

        if (qr.password) {
          router.replace(`/protected/${code}`);
          return;
        }

        // ── Real Analytics Logging ──
        try {
          const { device, browser, os } = parseUserAgent(navigator.userAgent);

          // Get real location via ipapi.co (free, no API key needed)
          let country = "Unknown";
          let city = "Unknown";
          try {
            const geoRes = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
            if (geoRes.ok) {
              const geo = await geoRes.json();
              country = geo.country_name || "Unknown";
              city = geo.city || "Unknown";
            }
          } catch {
            // Geo lookup failed silently — don't block the redirect
          }

          await addDoc(qrScansRef, {
            qr_id: qr.id,
            user_id: qr.user_id,
            timestamp: serverTimestamp(),
            device,
            browser,
            os,
            country,
            city,
          });

          await updateDoc(doc(db, "qr_codes", qr.id), {
            scan_count: increment(1)
          });
        } catch (e) {
          console.error("Analytics log failed", e);
        }

        // ── Redirect ──
        if (qr.type === "multi") {
          router.replace(`/smart/${code}`);
        } else if (qr.destination_url) {
          window.location.replace(qr.destination_url);
        } else {
          setError("This QR code has no valid destination configured.");
        }

      } catch (err) {
        console.error(err);
        setError("A system error occurred. Please try scanning again.");
      }
    };

    processQR();
  }, [params.code, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[120px] -z-10" />
        <div className="w-20 h-20 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Invalid QR Code</h1>
        <p className="text-muted-foreground max-w-sm mb-8">{error}</p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <QrCode className="w-4 h-4" /> Create your own QR
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm animate-pulse">Redirecting...</p>
      </div>
    </div>
  );
}
