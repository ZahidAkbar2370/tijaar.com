"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Get Firebase app (client-only). Returns null if not in browser or config missing. */
export function getFirebaseApp() {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

/** Get FCM messaging instance. Returns null if unsupported or not in browser. */
export async function getFirebaseMessaging() {
  const supported = await isSupported();
  if (!supported || typeof window === "undefined") return null;
  const app = getFirebaseApp();
  if (!app) return null;
  return getMessaging(app);
}

export const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";
