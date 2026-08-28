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

/** Imperative FCM setup — dynamically imported so Firebase stays off the initial bundle. */
export async function initFcm(onForegroundMessage) {
  if (typeof window === "undefined") return;

  const { getToken, onMessage } = await import("firebase/messaging");
  const { getFirebaseMessaging, vapidKey } = await import("@/lib/firebase");

  if (!vapidKey) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    const token = await getToken(messaging, { vapidKey });
    if (token) await registerFcmTokenWithBackend(token);

    onMessage(messaging, (payload) => {
      const title = payload?.notification?.title || payload?.data?.title || "Notification";
      const body = payload?.notification?.body || payload?.data?.body || "";
      onForegroundMessage?.(body ? `${title}: ${body}` : title);
    });
  } catch (err) {
    console.warn("[FCM] init failed:", err);
  }
}
