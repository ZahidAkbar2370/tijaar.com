"use client";

/**
 * Shared form section / field primitives used by Sell an Item, Add/Edit Product, etc.
 */

export function FormSection({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <section className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-gray-100">
        {Icon && (
          <span className="w-9 h-9 rounded-lg bg-[#1790d7]/10 text-[#1790d7] flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px]" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-[15px] sm:text-base leading-tight">{title}</h3>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-4">{children}</div>
    </section>
  );
}

export function FormField({ label, required, hint, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="flex items-baseline gap-1 mb-1.5">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function formInputClass(hasError) {
  return `w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border bg-white text-gray-900 text-sm sm:text-[15px] placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7] ${
    hasError ? "border-red-400" : "border-gray-200 hover:border-gray-300"
  }`;
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-xl text-sm font-semibold hover:border-[#1790d7]/40 hover:text-[#1790d7] shadow-sm transition";
