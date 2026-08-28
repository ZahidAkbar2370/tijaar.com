"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { conversationApi } from "@/lib/api";
import ChatDrawer from "./ChatDrawer";

export default function ChatFAB() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const r = await conversationApi.unreadCount();
      setUnreadCount(r.unread_count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const t = setInterval(fetchUnread, 15000);
    return () => clearInterval(t);
  }, [fetchUnread]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[124px] right-6 z-30 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
        style={{ backgroundColor: "#25D366" }}
        aria-label="Open chat"
      >
        <MessageCircle className="w-7 h-7" strokeWidth={2} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse"
            title={`You have ${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {unreadCount > 0 && (
        <div
          className="fixed bottom-[180px] right-6 z-30 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm shadow-xl max-w-[220px]"
          role="status"
        >
          You have {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
        </div>
      )}
      <ChatDrawer
        open={open}
        onClose={() => setOpen(false)}
        onUnreadChange={fetchUnread}
      />
    </>
  );
}
