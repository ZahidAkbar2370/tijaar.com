"use client";

import { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";
import { sessionsApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";

export default function ActiveSessions() {
  const { showSuccess, showError } = useSnackbar();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionsApi
      .list()
      .then((r) => setSessions(r.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRevokeSession = async (tokenId) => {
    try {
      await sessionsApi.revoke(tokenId);
      setSessions((prev) => prev.filter((s) => s.id !== tokenId));
      showSuccess?.("Session revoked.");
    } catch (err) {
      showError?.(err?.message || "Failed to revoke session.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80">
      <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Smartphone className="w-5 h-5 text-[#1790d7]" />
        Active Sessions
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Devices and browsers signed in to your account. Revoke any you don&apos;t recognize.
      </p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500 text-sm">No active sessions found.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">{s.name || "Session"}</p>
                <p className="text-xs text-gray-500">
                  Last used:{" "}
                  {s.last_used_at
                    ? new Date(s.last_used_at).toISOString().slice(0, 16).replace("T", " ")
                    : "Never"}
                </p>
              </div>
              {s.is_current ? (
                <span className="text-xs text-[#1790d7] font-medium">Current</span>
              ) : (
                <button
                  onClick={() => handleRevokeSession(s.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
