"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { reviewApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";

export default function ProductReviews({ productId, productSellerId = null, productSellerType = null }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [helpfulBusy, setHelpfulBusy] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyBusy, setReplyBusy] = useState(null);

  const isProductSeller =
    !!user?.id &&
    productSellerId != null &&
    String(user.id) === String(productSellerId) &&
    (user.role === "seller" || user.is_private_seller || productSellerType === "private");

  const load = (p = 1, append = false) => {
    reviewApi
      .list({ reviewable_type: "product", reviewable_id: productId, per_page: 5, page: p })
      .then((res) => {
        setReviews((prev) => (append ? [...prev, ...(res.reviews || [])] : (res.reviews || [])));
        setStats(res.stats || { total: 0, average: 0, distribution: {} });
        setHasMore((res.pagination?.current_page || 1) < (res.pagination?.last_page || 1));
        setPage(p);
      })
      .catch(() => !append && setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!productId) return;
    load(1);
  }, [productId, user?.id]);

  const handleHelpful = async (reviewId) => {
    if (!user) {
      showError?.("Please log in to mark a review as helpful.");
      return;
    }
    if (helpfulBusy === reviewId) return;
    setHelpfulBusy(reviewId);
    try {
      const res = await reviewApi.helpful(reviewId);
      const helpful = !!res?.helpful;
      const count = res?.helpful_count;
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                is_helpful: helpful,
                helpful_count: typeof count === "number" ? count : helpful ? (r.helpful_count || 0) + 1 : Math.max(0, (r.helpful_count || 0) - 1),
              }
            : r
        )
      );
      showSuccess?.(helpful ? "Marked as helpful" : "Removed helpful");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Could not update helpful");
    } finally {
      setHelpfulBusy(null);
    }
  };

  const handleReply = async (reviewId) => {
    const body = String(replyDrafts[reviewId] || "").trim();
    if (!body) {
      showError?.("Enter a reply");
      return;
    }
    setReplyBusy(reviewId);
    try {
      const res = await reviewApi.reply(reviewId, body);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, reply: res.reply || { body } } : r))
      );
      setReplyDrafts((p) => ({ ...p, [reviewId]: "" }));
      showSuccess?.(res.message || "Reply posted");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Could not post reply");
    } finally {
      setReplyBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Customer reviews</h2>
        {stats.total > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => {
                const avg = Number(stats.average) || 0;
                const filled = i <= Math.round(avg);
                return (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${filled ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                  />
                );
              })}
            </div>
            <span className="text-sm text-gray-600">
              {Number(stats.average) || 0} ({stats.total} reviews)
            </span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Reviews can be submitted from My Orders after your order is completed. One review per product; sellers may reply once.
      </p>

      {loading ? (
        <div className="py-8 text-center text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-gray-500">No reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((r) => {
            const marked = !!r.is_helpful;
            const hasReply = !!(r.reply?.body || r.replies?.[0]?.body);
            const replyBody = r.reply?.body || r.replies?.[0]?.body;
            return (
              <div key={r.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{r.user?.name}</span>
                      {r.is_verified_purchase && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Verified</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    {r.title && <p className="font-medium text-gray-900 mb-1">{r.title}</p>}
                    <p className="text-gray-600 text-sm">{r.body}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  {user && (
                    <button
                      type="button"
                      onClick={() => handleHelpful(r.id)}
                      disabled={helpfulBusy === r.id}
                      aria-pressed={marked}
                      className={`flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        marked
                          ? "bg-[#1790d7]/10 text-[#1790d7] font-semibold"
                          : "text-gray-500 hover:text-[#1790d7] hover:bg-gray-50"
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${marked ? "fill-current" : ""}`} />
                      Helpful ({r.helpful_count || 0})
                    </button>
                  )}
                </div>
                {hasReply ? (
                  <div className="mt-4 ml-6 pl-4 border-l-2 border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Seller reply</p>
                    <p className="text-sm text-gray-600">{replyBody}</p>
                  </div>
                ) : isProductSeller ? (
                  <div className="mt-4 ml-0 sm:ml-6 space-y-2">
                    <textarea
                      value={replyDrafts[r.id] || ""}
                      onChange={(e) => setReplyDrafts((p) => ({ ...p, [r.id]: e.target.value }))}
                      rows={2}
                      maxLength={2000}
                      placeholder="Write a one-time reply to this review…"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleReply(r.id)}
                      disabled={replyBusy === r.id}
                      className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#1790d7] hover:bg-[#1277b8] text-white disabled:opacity-60"
                    >
                      {replyBusy === r.id ? "Posting…" : "Post reply"}
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
          {hasMore && (
            <button
              type="button"
              onClick={() => load(page + 1, true)}
              className="text-sm text-[#1790d7] hover:underline"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
