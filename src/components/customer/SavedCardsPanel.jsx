"use client";

import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { savedCardsApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { confirmDelete } from "@/lib/sweetAlert";

export default function SavedCardsPanel() {
  const { showSuccess, showError } = useSnackbar();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    savedCardsApi
      .list()
      .then((r) => setCards(r.cards || []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSetDefault = async (id) => {
    try {
      await savedCardsApi.setDefault(id);
      load();
      showSuccess?.("Default card updated.");
    } catch (err) {
      showError?.(err?.message || "Failed to update default card.");
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirmDelete("Remove this saved card?");
    if (!ok) return;
    try {
      await savedCardsApi.delete(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
      showSuccess?.("Card removed.");
    } catch (err) {
      showError?.(err?.message || "Failed to remove card.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80">
      <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-[#1790d7]" />
        Saved Cards
      </h2>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : cards.length === 0 ? (
        <p className="text-gray-500 text-sm">No saved cards yet. Add a card at checkout to save it here.</p>
      ) : (
        <div className="space-y-2">
          {cards.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">
                  {(c.brand || c.card_brand || "Card").toString()} •••• {c.last4}
                </p>
                {(c.exp_month || c.exp_year) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Exp {c.exp_month}/{c.exp_year}
                  </p>
                )}
                {c.is_default && <span className="text-xs text-[#1790d7] font-medium">Default</span>}
              </div>
              <div className="flex gap-3">
                {!c.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(c.id)}
                    className="text-sm text-[#1790d7] hover:underline font-medium"
                  >
                    Set default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-sm text-red-600 hover:underline font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
