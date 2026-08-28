"use client";

import { useEffect, useRef } from "react";
import { useAuthContext } from "@/context/AuthProvider";
import { useSnackbar } from "@/context/SnackbarContext";
import { notificationPreferencesApi } from "@/lib/api";

function webPushEnabledFromPrefs(prefs) {
  const webPrefs = prefs.filter((p) => p.channel === "push_web");
  if (webPrefs.length === 0) return true;
  return webPrefs.some((p) => p.enabled);
}

/** Load Firebase/FCM only after login when website push alerts are enabled. */
export default function FcmLoader() {
  const { isAuthenticated } = useAuthContext();
  const { showInfo } = useSnackbar();
  const started = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || started.current) return;
    started.current = true;

    const run = async () => {
      try {
        const res = await notificationPreferencesApi.list();
        if (!webPushEnabledFromPrefs(res.preferences || [])) return;
        const { initFcm } = await import("@/lib/fcmInit");
        await initFcm(showInfo);
      } catch {
        /* ignore */
      }
    };

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => { run(); }, { timeout: 8000 });
    } else {
      setTimeout(run, 5000);
    }
  }, [isAuthenticated, showInfo]);

  return null;
}
