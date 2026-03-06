"use client";

import { useEffect } from "react";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/db";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleOneTap() {
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    if (auth.currentUser) return; // Already signed in — don't show prompt

    // Load the Google Identity Services script dynamically
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => initOneTap();
    document.body.appendChild(script);

    return () => {
      // Cleanup — cancel prompt if component unmounts
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
      document.body.removeChild(script);
    };
  }, [clientId]);

  const initOneTap = () => {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,           // Don't auto sign-in without user gesture
      cancel_on_tap_outside: true,
      context: "signin",
    });

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.log("One-Tap not displayed:", notification.getNotDisplayedReason());
      }
      if (notification.isSkippedMoment()) {
        console.log("One-Tap skipped:", notification.getSkippedReason());
      }
    });
  };

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      // Exchange the Google ID token for a Firebase credential
      const credential = GoogleAuthProvider.credential(response.credential);
      const result = await signInWithCredential(auth, credential);

      // Make sure their Firestore profile exists
      await createUserProfile(
        result.user.uid,
        result.user.email,
        result.user.displayName
      );

      toast.success(`Welcome, ${result.user.displayName || "User"}! 🎉`);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("One-Tap sign-in failed:", error);
      toast.error("Sign-in failed. Please try again.");
    }
  };

  // This component renders nothing visible — the One-Tap UI is injected by Google
  return null;
}
