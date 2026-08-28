"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, ShoppingBag, DollarSign } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { notificationApi } from "@/lib/api";
import PageHero from "@/components/customer/PageHero";

export default function VendorNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    notificationApi
      .list()
      .then((r) => {
        const list = r?.data ?? [];
        setNotifications(Array.isArray(list) ? list : []);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="space-y-6">
        <PageHero
          title="Alerts"
          description="New order notifications, payout alerts, and other updates. Stay on top of your store activity."
          illustration="notifications"
          guide="Tip: New orders and payout updates appear here. Click a notification to open the related order or payout page."
        />

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
              <h2 className="font-semibold text-gray-900">No alerts yet</h2>
              <p className="text-sm text-gray-600 mt-1">When you receive new orders, payout notifications, or other updates, they&apos;ll appear here.</p>
              <Link href="/seller/orders" className="inline-block mt-4 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
                View Orders
              </Link>
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
              {notifications.map((n) => {
                const orderId = n.data?.id || n.data?.order_id;
                const isPayout = (n.title || n.data?.title || "").toLowerCase().includes("payout");
                const href = n.data?.deep_link || (orderId ? `/seller/orders/${orderId}` : isPayout ? "/seller/payouts" : null);
                return (
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
                      n.read_at ? "bg-white border-gray-200/80" : "bg-amber-50/50 border-amber-200/60"
                    }`}
                  >
                    {href ? (
                      <Link href={href} className="block">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            {isPayout ? <DollarSign className="w-5 h-5 text-amber-600" /> : <ShoppingBag className="w-5 h-5 text-amber-600" />}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{n.title || n.data?.title || "Notification"}</p>
                            <p className="text-sm text-gray-600 mt-1">{n.body || n.data?.body || ""}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-amber-600" />
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{n.title || n.data?.title || "Notification"}</p>
                          <p className="text-sm text-gray-600 mt-1">{n.body || n.data?.body || ""}</p>
                          <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
