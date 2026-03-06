"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { 
  updateProfile, updatePassword, 
  EmailAuthProvider, reauthenticateWithCredential,
  deleteUser
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Lock, Shield, CreditCard, AlertTriangle, Loader2, Crown, Zap } from "lucide-react";

export default function SettingsPage() {
  const { user, isPro, plan } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdatingProfile(true);
    try {
      await updateProfile(user, { displayName });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        toast.error("Current password is incorrect.");
      } else {
        toast.error(error.message || "Failed to update password.");
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm.");
      return;
    }

    setDeleting(true);
    try {
      // 1. Re-authenticate (required by Firebase before deletion)
      if (deletePassword) {
        const credential = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(user, credential);
      }

      // 2. Delete all user's QR codes from Firestore
      const qrQuery = query(collection(db, "qr_codes"), where("user_id", "==", user.uid));
      const qrSnap = await getDocs(qrQuery);
      const qrDeletes = qrSnap.docs.map((d) => deleteDoc(doc(db, "qr_codes", d.id)));
      await Promise.all(qrDeletes);

      // 3. Delete all user's scan data
      const scanQuery = query(collection(db, "qr_scans"), where("user_id", "==", user.uid));
      const scanSnap = await getDocs(scanQuery);
      const scanDeletes = scanSnap.docs.map((d) => deleteDoc(doc(db, "qr_scans", d.id)));
      await Promise.all(scanDeletes);

      // 4. Delete user document from Firestore
      await deleteDoc(doc(db, "users", user.uid));

      // 5. Delete the Firebase Auth account
      await deleteUser(user);

      toast.success("Account permanently deleted.");
      window.location.href = "/";

    } catch (error: any) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        toast.error("Incorrect password. Account not deleted.");
      } else if (error.code === "auth/requires-recent-login") {
        toast.error("Please re-enter your password to confirm deletion.");
      } else {
        toast.error(error.message || "Failed to delete account.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const isGoogleUser = user?.providerData?.[0]?.providerId === "google.com";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and security.</p>
      </div>

      {/* Profile Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Profile
          </CardTitle>
          <CardDescription>Update your public display name.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled className="bg-background/50 opacity-60 cursor-not-allowed" />
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" placeholder="Your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-background/50" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={updatingProfile}>
              {updatingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Password Card — only shown for email/password accounts */}
      {!isGoogleUser && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" /> Change Password
            </CardTitle>
            <CardDescription>Update your account password. You'll need your current password to confirm.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPw">Current Password</Label>
                <Input id="currentPw" type="password" placeholder="Your current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPw">New Password</Label>
                <Input id="newPw" type="password" placeholder="At least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPw">Confirm New Password</Label>
                <Input id="confirmPw" type="password" placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-background/50" />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="outline" disabled={updatingPassword}>
                {updatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Plan Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent" /> Plan & Billing
          </CardTitle>
          <CardDescription>Your current subscription tier.</CardDescription>
        </CardHeader>
        <CardContent>
          {isPro ? (
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-yellow-400 text-lg">PRO Plan</span>
                </div>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-semibold">Active</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400"/>Unlimited QR codes</li>
                <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400"/>Password protection & expiry dates</li>
                <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400"/>Smart Landing Pages (multi-link)</li>
                <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400"/>Custom QR colors & branding</li>
                <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400"/>Full analytics & CSV export</li>
              </ul>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-lg">Free Plan</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Current</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>✓ Up to 5 active QR codes</li>
                <li>✓ Basic analytics</li>
                <li>✗ Password protection</li>
                <li>✗ Expiry dates</li>
                <li>✗ Smart landing pages</li>
              </ul>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Crown className="w-4 h-4 text-yellow-400 shrink-0"/>
                <p className="text-xs text-muted-foreground">Contact the admin to upgrade your account to Pro.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card/50 backdrop-blur-sm border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="w-5 h-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete your account and all data.</CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <div>
                <p className="font-semibold">Delete Account</p>
                <p className="text-sm text-muted-foreground">Deletes your account, all QR codes, and all scan data. Cannot be undone.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4 p-4 rounded-xl bg-destructive/5 border border-destructive/30">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                <p className="text-sm font-medium text-destructive">This action is permanent and cannot be undone.</p>
              </div>
              <p className="text-xs text-muted-foreground">All your QR codes, analytics, and data will be permanently deleted.</p>
              
              {!isGoogleUser && (
                <div className="space-y-2">
                  <Label htmlFor="deletePassword" className="text-sm">Confirm your password</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required={!isGoogleUser}
                    className="bg-background/50 border-destructive/30 focus-visible:ring-destructive/40"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="deleteConfirm" className="text-sm">
                  Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm
                </Label>
                <Input
                  id="deleteConfirm"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  required
                  className="bg-background/50 border-destructive/30 focus-visible:ring-destructive/40 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                  disabled={deleting || deleteConfirmText !== "DELETE"}
                >
                  {deleting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting everything...</>
                  ) : (
                    "Permanently Delete My Account"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteConfirmText(""); }}
                  disabled={deleting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
