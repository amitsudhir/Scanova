"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  sendEmailVerification
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserProfile } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, Mail, RefreshCw } from "lucide-react";
import { GoogleOneTap } from "@/components/GoogleOneTap";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Ensure user profile exists in Firestore
      await createUserProfile(result.user.uid, result.user.email, result.user.displayName);
      toast.success(`Welcome back, ${result.user.displayName || "User"}!`);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        // User closed popup — silent, do nothing
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    setResendLoading(true);
    try {
      await sendEmailVerification(unverifiedUser);
      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedUser(null);
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check email verification
      if (!result.user.emailVerified) {
        setUnverifiedUser(result.user);
        await auth.signOut();
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled. Contact support.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#050508] text-white">
      {/* Google One-Tap — renders as a floating native prompt */}
      <GoogleOneTap />
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:48px_48px] z-0 opacity-40" />
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-pulse duration-[15000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/20 blur-[150px] mix-blend-screen animate-pulse delay-[5000ms] duration-[15000ms]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-[#050508] z-10" />
      </div>

      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md p-8 sm:p-10 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)] z-20 relative">
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl mb-6 hover:scale-105 transition-transform">
              <img src="/Scanova_logo.jpg" alt="Scanova" className="w-full h-full object-cover" />
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Log in to your Scanova account</p>
          </div>

          {/* Google Sign-In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl bg-white/5 border-white/15 hover:bg-white/10 text-white gap-3 mb-6 text-sm font-medium"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-3 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          {/* Email Unverified Banner */}
          {unverifiedUser && (
            <div className="mb-5 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
              <div className="flex items-start gap-3 mb-3">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Your email is not verified yet. Please check your inbox and click the verification link before logging in.</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 gap-2"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                <RefreshCw className={`w-3 h-3 ${resendLoading ? "animate-spin" : ""}`} />
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </Button>
            </div>
          )}

          {/* Generic Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 ml-1">Email address</Label>
              <Input 
                id="email" type="email" placeholder="name@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); setUnverifiedUser(null); }}
                required
                className="h-12 bg-black/40 border-white/10 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50 transition-all rounded-xl text-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
              </div>
              <Input 
                id="password" type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
                className="h-12 bg-black/40 border-white/10 focus-visible:ring-primary/50 transition-all rounded-xl text-white"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-md font-medium rounded-xl bg-white text-black hover:bg-neutral-200 transition-all shadow-lg" disabled={loading || googleLoading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="text-center mt-8 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white font-medium hover:underline">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
