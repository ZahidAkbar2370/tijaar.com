"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { disputeApi } from "@/lib/api";
import PageHero from "@/components/customer/PageHero";

export default function VendorDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    disputeApi.list().then((r) => setDisputes(r.disputes || [])).catch(() => setDisputes([])).finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="space-y-6">
        <PageHero
          title="Disputes"
          description="Disputes raised by buyers on orders containing your products. Respond to refund requests, returns, or delivery issues. Our team will help resolve conflicts fairly."
          illustration="disputes"
          guide="Tip: Click a dispute to view details and respond. Reply promptly; our team will review and mediate if needed."
        />

        {loading ? (
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ) : disputes.length === 0 ? (
          <div className="flex flex-col lg:flex-row items-center gap-6 p-8 rounded-2xl bg-gray-50 border border-gray-200/60 text-center lg:text-left">
            <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-16 h-16 text-orange-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">No disputes</h2>
              <p className="text-sm text-gray-600 mt-1">No disputes have been raised on your orders. Continue providing great service to keep it that way.</p>
              <Link href="/seller/orders" className="inline-block mt-4 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">
                View Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((d) => (
              <Link
                key={d.id}
                href={`/seller/disputes/${d.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-200/80 bg-white hover:border-amber-300 hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-medium text-gray-900">{d.dispute_number}</p>
                  <p className="text-sm text-gray-500">Order #{d.order?.order_number}</p>
                  <p className="text-sm text-gray-600 mt-1 capitalize">{d.type} – {d.status}</p>
                </div>
                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                  d.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                  d.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {d.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
