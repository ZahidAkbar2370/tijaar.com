"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { notificationApi } from "@/lib/api";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    Promise.all([notificationApi.list({ page: 1, per_page: 5 }), notificationApi.unreadCount()])
      .then(([listRes, countRes]) => {
        setNotifications(listRes?.data ?? []);
        setUnreadCount(countRes?.count ?? 0);
      })
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  const isSeller = user?.role === "seller";
  const viewAllHref = isSeller ? "/seller/notifications" : "/customer/notifications";

  return (
    <>
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center z-10">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[9999]">
        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
          <span className="font-semibold text-gray-900">{isSeller ? "Alerts" : "Notifications"}</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              {isSeller ? "No new orders or payout alerts" : "No notifications"}
            </div>
          ) : (
            notifications.slice(0, 5).map((n) => {
              const href = n.data?.deep_link || (isSeller && n.data?.id ? "/seller/orders/" + n.data.id : viewAllHref) || viewAllHref;
              return (
                <Link
                  key={n.id}
                  href={href.startsWith("http") ? viewAllHref : href}
                  className={`block px-4 py-3 hover:bg-gray-50 ${!n.read_at ? "bg-blue-50/50" : ""}`}
                >
                  <p className="font-medium text-gray-900 text-sm line-clamp-1">{n.title || n.data?.title || "Notification"}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body || n.data?.body || ""}</p>
                </Link>
              );
            })
          )}
        </div>
        <Link
          href={viewAllHref}
          className="block px-4 py-2 text-center text-[#1790d7] text-sm font-medium hover:bg-gray-50 border-t border-gray-100"
        >
          View all
        </Link>
      </div>
    </>
  );
}
