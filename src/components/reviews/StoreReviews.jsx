"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { reviewApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";

export default function StoreReviews({ storeId, perPage = 10, className = "" }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!storeId) return;
    reviewApi
      .list({ reviewable_type: "store", reviewable_id: storeId, per_page: perPage })
      .then((res) => {
        setReviews(res.reviews || []);
        setStats(res.stats || { total: 0, average: 0 });
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), [storeId, perPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showError?.("Login to submit a review");
      return;
    }
    setSubmitting(true);
    try {
      await reviewApi.create({
        reviewable_type: "store",
        reviewable_id: storeId,
        rating: form.rating,
        title: form.title.trim() || undefined,
        body: form.body.trim() || undefined,
      });
      showSuccess?.("Review submitted. It will appear after moderation.");
      setShowForm(false);
      setForm({ rating: 5, title: "", body: "" });
      load();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 border border-gray-100 ${className}`}>
        <div className="py-8 text-center text-gray-500 text-sm">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          Store Reviews ({stats.total})
        </h3>
        {user && !showForm && (
          <button onClick={() => setShowForm(true)} className="text-sm text-[#1790d7] hover:underline">
            Write a review
          </button>
        )}
      </div>
      {showForm && user && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => setForm((p) => ({ ...p, rating: i }))} className="p-1">
                <Star className={`w-6 h-6 ${i <= form.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Title (optional)"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
          />
          <textarea
            placeholder="Your review"
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            rows={2}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#1790d7] text-white rounded-xl text-sm disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews yet.</p>
      ) : (
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex items-center gap-2 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                />
              ))}
              <span className="text-sm text-gray-600">{r.user?.name}</span>
            </div>
            {r.title && <p className="font-medium text-gray-900 text-sm">{r.title}</p>}
            <p className="text-gray-600 text-sm">{r.body}</p>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
