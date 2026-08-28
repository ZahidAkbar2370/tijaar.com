"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { notificationApi } from "@/lib/api";
import PageHero from "@/components/customer/PageHero";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationApi.list().then((r) => setNotifications(r.data || [])).catch(() => setNotifications([])).finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="relative">
          <PageHero
            title="Notifications"
            description="Stay updated on orders, messages, price drops, and important updates. Manage your notification preferences to control what you receive."
            illustration="notifications"
            guide="Tip: Scroll to see all notifications. Mark as read or open notification preferences from the sidebar to control what you receive."
          />
          <Link
            href="/customer/notifications/preferences"
            className="absolute top-6 right-6 text-sm font-medium text-[#1790d7] hover:text-[#1277b8] hover:underline z-10"
          >
            Preferences →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col lg:flex-row items-center gap-6 p-8 rounded-2xl bg-gray-50 border border-gray-200/60 text-center lg:text-left">
            <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-16 h-16 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">No notifications yet</h2>
              <p className="text-sm text-gray-600 mt-1">When you have orders, messages, or updates, they&apos;ll appear here. You can customize what you receive in Preferences.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  try {
                    await notificationApi.markAllRead();
                    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
                  } catch {}
                }}
                className="text-sm font-medium text-[#1790d7] hover:underline"
              >
                Mark all as read
              </button>
            </div>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={async () => {
                    if (!n.read_at) {
                      try {
                        await notificationApi.markRead(n.id);
                        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
                      } catch {}
                    }
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    n.read_at ? "bg-white border-gray-200/80" : "bg-blue-50/50 border-blue-200/60"
                  }`}
                >
                  <p className="font-medium text-gray-900">{n.title || n.data?.title || "Notification"}</p>
                  <p className="text-sm text-gray-600 mt-1">{n.body || n.data?.body || ""}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
