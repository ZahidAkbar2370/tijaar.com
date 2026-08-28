"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Flag, ImagePlus, ShieldAlert, ExternalLink } from "lucide-react";
import { conversationApi, getBackendBaseUrl } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = getBackendBaseUrl?.() || "";
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function ProductPreviewBubble({ preview, isMine }) {
  if (!preview) return null;
  const href = preview.url || (preview.slug ? `/product/${preview.slug}` : null);
  return (
    <div className={`max-w-[85%] rounded-xl border overflow-hidden shadow-sm ${isMine ? "ml-auto bg-[#DCF8C6]" : "bg-white"}`}>
      <div className="flex gap-3 p-3">
        {preview.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveImageUrl(preview.image_url)} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-xs text-gray-400">No image</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Product inquiry</p>
          <p className="text-sm font-semibold text-gray-900 line-clamp-2">{preview.name}</p>
          {preview.price != null && (
            <p className="text-sm text-[#1790d7] font-semibold mt-1">Rs {Number(preview.price).toLocaleString("en-PK")}</p>
          )}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#1790d7] font-medium mt-2 hover:underline"
            >
              View product <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isMine = message.is_mine;
  if (message.type === "product_preview") {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
        <ProductPreviewBubble preview={message.product_preview} isMine={isMine} />
      </div>
    );
  }

  const imageAttachment = message.attachments?.find((a) => a.mime_type?.startsWith("image/"));

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-xl shadow-sm ${
          isMine ? "bg-[#1790d7] text-white rounded-br-sm" : "bg-white border border-gray-200 rounded-bl-sm"
        }`}
      >
        {imageAttachment && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(imageAttachment.url)}
            alt={imageAttachment.name || "Image"}
            className="max-w-full rounded-lg mb-1 max-h-64 object-contain"
          />
        )}
        {message.body ? <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p> : null}
        <p className={`text-[10px] mt-1 ${isMine ? "text-white/75 text-right" : "text-gray-400"}`}>
          {message.created_at ? new Date(message.created_at).toLocaleString() : ""}
        </p>
      </div>
    </div>
  );
}

export default function MessagesInbox({
  autoStartProductId = null,
  initialConversationId = null,
  pollMs = 8000,
}) {
  const { showSuccess, showError } = useSnackbar();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(initialConversationId);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [safetyNotice, setSafetyNotice] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const startedProductRef = useRef(null);

  const loadList = useCallback(async () => {
    try {
      const r = await conversationApi.list();
      setConversations(r.conversations || []);
      if (r.safety_notice) setSafetyNotice(r.safety_notice);
    } catch {
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadThread = useCallback(async (id, background = false) => {
    if (!id) return;
    if (!background) setLoadingThread(true);
    try {
      const r = await conversationApi.get(id);
      setConversation(r.conversation);
      setMessages(r.messages || []);
      if (r.safety_notice) setSafetyNotice(r.safety_notice);
    } catch {
      if (!background) {
        setConversation(null);
        setMessages([]);
      }
    } finally {
      if (!background) setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!autoStartProductId || startedProductRef.current === autoStartProductId) return;
    startedProductRef.current = autoStartProductId;
    setStarting(true);
    conversationApi
      .start({ product_id: parseInt(autoStartProductId, 10) })
      .then((r) => {
        setSelectedId(r.conversation.id);
        loadList();
      })
      .catch((err) => showError?.(err?.data?.message || err?.message || "Could not start chat"))
      .finally(() => setStarting(false));
  }, [autoStartProductId, loadList, showError]);

  useEffect(() => {
    if (initialConversationId) setSelectedId(initialConversationId);
  }, [initialConversationId]);

  useEffect(() => {
    if (selectedId) loadThread(selectedId);
    else {
      setConversation(null);
      setMessages([]);
    }
  }, [selectedId, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedId) return undefined;
    const t = setInterval(() => {
      loadList();
      loadThread(selectedId, true);
    }, pollMs);
    return () => clearInterval(t);
  }, [selectedId, pollMs, loadList, loadThread]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedId || sending) return;
    if (!newMessage.trim() && !imageFile) return;
    setSending(true);
    try {
      const res = await conversationApi.sendMessage(selectedId, {
        body: newMessage.trim(),
        image: imageFile,
      });
      setMessages((p) => [...p, { ...res.message, is_mine: true }]);
      setNewMessage("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadList();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const selectedConvo = conversations.find((c) => c.id === selectedId);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden min-h-[560px] lg:min-h-[calc(100vh-220px)] flex flex-col">
      <div className="flex-1 flex min-h-0">
        {/* Left: conversations */}
        <div className="w-full sm:w-[280px] lg:w-[320px] shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="px-4 py-3 border-b border-gray-100 bg-white">
            <p className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1790d7]" />
              Recent chats
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList || starting ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                No conversations yet. Message a seller from any product page.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((c) => {
                  const active = c.id === selectedId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-white transition ${active ? "bg-white border-l-4 border-[#1790d7]" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {c.product?.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resolveImageUrl(c.product.image_url)} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-[#1790d7]/10 flex items-center justify-center shrink-0 text-[#1790d7] font-semibold text-sm">
                            {c.other_user?.name?.charAt(0) || "?"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-gray-900 truncate">{c.other_user?.name}</p>
                            {c.unread_count > 0 && (
                              <span className="shrink-0 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                                {c.unread_count}
                              </span>
                            )}
                          </div>
                          {c.product?.name && <p className="text-xs text-gray-500 truncate">Re: {c.product.name}</p>}
                          {c.last_message?.body && (
                            <p className="text-xs text-gray-600 truncate mt-0.5">{c.last_message.body}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: thread */}
        <div className="hidden sm:flex flex-1 flex-col min-w-0">
          {selectedId ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3 bg-white">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{conversation?.other_user?.name || selectedConvo?.other_user?.name}</p>
                  {(conversation?.product || selectedConvo?.product) && (
                    <p className="text-xs text-gray-500 truncate">
                      Re: {(conversation?.product || selectedConvo?.product)?.name}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await conversationApi.report(selectedId, "Inappropriate content");
                      showSuccess?.("Conversation reported");
                    } catch {
                      showError?.("Failed to report");
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 shrink-0"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
              </div>

              {safetyNotice && (
                <div className="mx-4 mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <p>{safetyNotice}</p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ECE5DD]/40">
                {loadingThread ? (
                  <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                ) : (
                  messages.map((m) => <MessageBubble key={m.id} message={m} />)
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="border-t border-gray-100 p-3 bg-white space-y-2">
                {imageFile && (
                  <p className="text-xs text-gray-600 flex items-center justify-between gap-2 px-1">
                    <span className="truncate">Image: {imageFile.name}</span>
                    <button type="button" className="text-red-600" onClick={() => { setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                      Remove
                    </button>
                  </p>
                )}
                <div className="flex gap-2 items-end">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0" title="Send image">
                    <ImagePlus className="w-5 h-5" />
                  </button>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message (text or image only)…"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20"
                  />
                  <button type="submit" disabled={sending || (!newMessage.trim() && !imageFile)} className="p-2.5 rounded-xl bg-[#1790d7] text-white disabled:opacity-50 shrink-0">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm">Select a chat on the left to view messages</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: show thread below when selected */}
      {selectedId && (
        <div className="sm:hidden border-t border-gray-200 flex flex-col max-h-[60vh]">
          <div className="px-4 py-2 border-b bg-white text-sm font-medium">{conversation?.other_user?.name}</div>
          {safetyNotice && (
            <div className="mx-3 mt-2 text-[11px] rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-amber-900">{safetyNotice}</div>
          )}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
          <form onSubmit={handleSend} className="p-2 border-t flex gap-2 bg-white">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 border rounded-lg"><ImagePlus className="w-4 h-4" /></button>
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Message…" />
            <button type="submit" disabled={sending} className="p-2 bg-[#1790d7] text-white rounded-lg"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}
    </div>
  );
}
