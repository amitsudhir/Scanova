"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Plan = "free" | "pro";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  plan: Plan;
  isPro: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  plan: "free",
  isPro: false,
  isAdmin: false,
});

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>("free");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setPlan((userDoc.data().plan as Plan) || "free");
          }
        } catch {
          setPlan("free");
        }
      } else {
        setPlan("free");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isPro = plan === "pro";
  const isAdmin = !!(user && ADMIN_UID && user.uid === ADMIN_UID);

  return (
    <AuthContext.Provider value={{ user, loading, plan, isPro, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
