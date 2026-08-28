"use client";

import { getToken, onMessage } from "firebase/messaging";
import { useCallback, useEffect, useRef } from "react";
import { getFirebaseMessaging, vapidKey } from "@/lib/firebase";
import { apiRequest } from "@/lib/api";

const DEVICE_NAME =
  typeof navigator !== "undefined"
    ? `${navigator.userAgent.split(" ").pop() || "Browser"} on ${navigator.platform || "Unknown"}`
    : "Web";

function registerFcmTokenWithBackend(token) {
  return apiRequest("/notifications/fcm-token", {
    method: "POST",
    body: JSON.stringify({
      fcm_token: token,
      device_type: "web",
      device_name: DEVICE_NAME,
    }),
  });
}

/**
 * Request notification permission, get FCM token, register with backend, and set up foreground listener.
 * Call when user is authenticated. onForegroundMessage(title, body) is called for in-app toast.
 */
export function useFcm(isAuthenticated, onForegroundMessage) {
  const onMessageRef = useRef(onForegroundMessage);
  useEffect(() => {
    onMessageRef.current = onForegroundMessage;
  }, [onForegroundMessage]);

  const requestPermissionAndRegister = useCallback(async () => {
    if (!isAuthenticated || typeof window === "undefined") return;
    if (!vapidKey) {
      console.warn("[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set; skipping token.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;
      const token = await getToken(messaging, { vapidKey });
      if (token) await registerFcmTokenWithBackend(token);
    } catch (err) {
      console.warn("[FCM] Token request or register failed:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    requestPermissionAndRegister();
  }, [isAuthenticated, requestPermissionAndRegister]);

  const unsubscribeRef = useRef(null);
  useEffect(() => {
    if (!isAuthenticated || !vapidKey) return;
    getFirebaseMessaging().then((messaging) => {
      if (!messaging) return;
      unsubscribeRef.current = onMessage(messaging, (payload) => {
        const title = payload?.notification?.title || payload?.data?.title || "Notification";
        const body = payload?.notification?.body || payload?.data?.body || "";
        if (onMessageRef.current) onMessageRef.current(title, body, payload?.data);
      });
    });
    return () => {
      if (typeof unsubscribeRef.current === "function") unsubscribeRef.current();
      unsubscribeRef.current = null;
    };
  }, [isAuthenticated]);
}
