"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone, Monitor, SmartphoneNfc } from "lucide-react";
import { notificationPreferencesApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";

const LABELS = {
  order: "Order updates",
  listing: "Listing updates",
  message: "New messages",
  promotion: "Promotions",
};

const CHANNEL_CONFIG = {
  email: {
    label: "Email",
    hint: "Messages sent to your inbox.",
    Icon: Mail,
    iconClass: "text-gray-400",
  },
  whatsapp: {
    label: "WhatsApp",
    hint: "Alerts on your verified WhatsApp number.",
    Icon: Smartphone,
    iconClass: "text-emerald-600",
  },
  push_web: {
    label: "Website",
    hint: "Browser push notifications when you use Tijaar on the web (Firebase).",
    Icon: Monitor,
    iconClass: "text-sky-600",
  },
  push_app: {
    label: "Mobile App",
    hint: "Push alerts in the Tijaar Flutter app when you sign in on your phone.",
    Icon: SmartphoneNfc,
    iconClass: "text-violet-600",
  },
};

const CHANNEL_ORDER = ["email", "whatsapp", "push_web", "push_app"];

function Toggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition ${enabled ? "bg-[#1790d7]" : "bg-gray-200"}`}
      aria-pressed={enabled}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition left-1 ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

async function maybeInitWebPush(onForegroundMessage) {
  try {
    const { initFcm } = await import("@/lib/fcmInit");
    await initFcm(onForegroundMessage);
  } catch {
    /* ignore */
  }
}

function webPushEnabled(prefs) {
  const webPrefs = prefs.filter((p) => p.channel === "push_web");
  if (webPrefs.length === 0) return true;
  return webPrefs.some((p) => p.enabled);
}

export default function NotificationPreferencesPanel() {
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    notificationPreferencesApi
      .list()
      .then((r) => setPrefs(r.preferences || []))
      .catch(() => setPrefs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (channel, type, enabled) => {
    try {
      await notificationPreferencesApi.update({ channel, type, enabled: !!enabled });
      const next = prefs.map((p) =>
        p.channel === channel && p.type === type ? { ...p, enabled } : p
      );
      setPrefs(next);

      if (channel === "push_web" && enabled && webPushEnabled(next)) {
        await maybeInitWebPush((msg) => showInfo?.(msg));
      }

      showSuccess?.("Notification preference updated.");
    } catch (err) {
      showError?.(err?.message || "Failed to update preference.");
    }
  };

  const channels = CHANNEL_ORDER.filter((ch) => prefs.some((p) => p.channel === ch));

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
      ) : prefs.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 text-gray-500 text-sm">
          No notification preferences available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => {
            const config = CHANNEL_CONFIG[channel] || {
              label: channel,
              hint: "",
              Icon: Bell,
              iconClass: "text-gray-400",
            };
            const { label, hint, Icon, iconClass } = config;
            const channelPrefs = prefs.filter((p) => p.channel === channel);
            if (channelPrefs.length === 0) return null;

            return (
              <div key={channel} className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${iconClass}`} />
                    <span className="font-semibold text-gray-900">{label}</span>
                  </div>
                  {hint ? <p className="text-xs text-gray-500 mt-1.5 ml-7">{hint}</p> : null}
                </div>
                <div className="divide-y divide-gray-100">
                  {channelPrefs.map((p) => (
                    <div key={`${p.channel}-${p.type}`} className="p-4 flex items-center justify-between">
                      <span className="font-medium text-gray-900">{LABELS[p.type] || p.type}</span>
                      <Toggle
                        enabled={!!p.enabled}
                        onToggle={() => handleToggle(p.channel, p.type, !p.enabled)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
