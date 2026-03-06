import { db } from "./firebase";
import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp, query, where, getDocs, addDoc } from "firebase/firestore";

// Collections
export const usersRef = collection(db, "users");
export const qrCodesRef = collection(db, "qr_codes");
export const qrLinksRef = collection(db, "qr_links");
export const qrScansRef = collection(db, "qr_scans");
export const qrEventsRef = collection(db, "qr_events");
export const campaignsRef = collection(db, "campaigns");

// User functions
export async function createUserProfile(uid: string, email: string | null, name: string | null) {
  const userDoc = doc(usersRef, uid);
  const snap = await getDoc(userDoc);
  if (!snap.exists()) {
    await setDoc(userDoc, {
      id: uid,
      email,
      name,
      plan: "free",
      created_at: serverTimestamp(),
      last_login: serverTimestamp()
    });
  } else {
    await updateDoc(userDoc, { last_login: serverTimestamp() });
  }
}

// Additional helpers will be added as needed for SmartQR features.
