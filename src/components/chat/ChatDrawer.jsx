"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, ChevronRight, ArrowLeft } from "lucide-react";
import { conversationApi } from "@/lib/api";

export default function ChatDrawer({ open, onClose, onUnreadChange }) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const loadConversations = useCallback(async (showLoading = true) => {
    if (showLoading) setLoadingConvos(true);
    try {
      const r = await conversationApi.list();
      setConversations(r.conversations || []);
    } catch {
      setConversations([]);
    } finally {
      if (showLoading) setLoadingConvos(false);
    }
  }, []);

  const loadMessages = useCallback(async (id, background = false) => {
    if (!id) return;
    if (!background) setLoading(true);
    try {
      const r = await conversationApi.get(id);
      const msgs = (r.messages || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setMessages(msgs);
      if (!background) onUnreadChange?.();
    } catch {
      if (!background) setMessages([]);
    } finally {
      if (!background) setLoading(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    if (open) {
      loadConversations(true);
    }
  }, [open, loadConversations]);

  useEffect(() => {
    if (open && selected?.id) {
      loadMessages(selected.id, false);
    } else {
      setMessages([]);
    }
  }, [open, selected?.id, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    pollRef.current = setInterval(() => {
      loadConversations(false);
      if (selected?.id) loadMessages(selected.id, true);
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [open, selected?.id, loadConversations, loadMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selected?.id) return;
    setSending(true);
    try {
      const res = await conversationApi.sendMessage(selected.id, { body: newMessage.trim() });
      setMessages((p) => [...p, { ...res.message, is_mine: true }]);
      setNewMessage("");
      loadConversations(false);
    } finally {
      setSending(false);
    }
  };

  const selectedConvo = conversations.find((c) => c.id === selected?.id);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[min(60vw,680px)] bg-[#ECE5DD] z-50 flex flex-col shadow-2xl animate-slide-in-right"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4ccc8' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-white/10 rounded-full">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="font-semibold">Chat</span>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Left: Conversation list (~40% of drawer) */}
          <div className="w-[38%] min-w-[140px] max-w-[200px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No conversations yet</p>
                  <p className="text-xs mt-1">Start a chat from a product page by clicking &quot;Message Seller&quot;</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#075E54]/20 flex items-center justify-center shrink-0">
                        <span className="text-[#075E54] font-semibold text-sm">
                          {c.other_user?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{c.other_user?.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {c.last_message?.body || (c.product ? `Re: ${c.product.name}` : "No messages")}
                        </p>
                      </div>
                      {c.unread_count > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[#25D366] text-white text-xs font-bold flex items-center justify-center">
                          {c.unread_count > 9 ? "9+" : c.unread_count}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Chat view */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {selected ? (
              <>
                <div className="flex-shrink-0 bg-[#075E54] text-white px-3 py-2 flex items-center gap-2">
                  <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-white/10 rounded-full shrink-0" title="Back">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <span className="font-semibold text-sm">{selectedConvo?.other_user?.name?.charAt(0) || "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedConvo?.other_user?.name}</p>
                    {selectedConvo?.product && (
                      <p className="text-xs text-white/80 truncate">Re: {selectedConvo.product.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundColor: "#ECE5DD" }}>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-[#075E54] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${m.is_mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${
                            m.is_mine
                              ? "bg-[#DCF8C6] rounded-br-none"
                              : "bg-white rounded-bl-none border border-gray-100"
                          }`}
                        >
                          <p className="text-sm text-gray-900 break-words">{m.body}</p>
                          <p
                            className={`text-[10px] mt-0.5 ${
                              m.is_mine ? "text-gray-500 text-right" : "text-gray-400"
                            }`}
                          >
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} className="flex-shrink-0 p-3 bg-[#F0F2F5] flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 px-4 py-2.5 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/30"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="p-2.5 rounded-full text-white shrink-0 disabled:opacity-50"
                    style={{ backgroundColor: sending ? "#999" : "#25D366" }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
                <MessageCircle className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-center">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
