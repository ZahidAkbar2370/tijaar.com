import Link from "next/link";
import { PackageSearch, Home, ArrowRight } from "lucide-react";

export default function ProductNotFound({ slug }) {
  return (
    <div className="min-h-[calc(100vh-220px)] bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center px-4 py-16 sm:py-20">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1790d7]/10 ring-1 ring-[#1790d7]/15 shadow-sm">
          <PackageSearch className="h-10 w-10 text-[#1790d7]" strokeWidth={1.5} aria-hidden="true" />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1790d7] mb-2">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Product not found</h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
          This item may have been removed, sold out, or the link may be incorrect. Browse our marketplace to find
          something else you&apos;ll love.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white font-semibold shadow-sm hover:shadow-md transition-all"
          >
            View all products
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
            Go home
          </Link>
        </div>

        {slug ? (
          <p className="mt-8 text-xs text-gray-400 break-all">
            Requested product: <span className="font-medium text-gray-500">{slug}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
