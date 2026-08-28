"use client";

import { useState } from "react";

const illustrations = {
  orders: "https://illustrations.popsy.co/amber/delivery-truck.svg",
  wishlist: "https://illustrations.popsy.co/amber/heart-in-hand.svg",
  messages: "https://illustrations.popsy.co/amber/chat-messages.svg",
  notifications: "https://illustrations.popsy.co/amber/bell.svg",
  disputes: "https://illustrations.popsy.co/amber/customer-support.svg",
  profile: "https://illustrations.popsy.co/amber/user-profile.svg",
  sell: "https://illustrations.popsy.co/amber/shopping-bags.svg",
  earnings: "https://illustrations.popsy.co/amber/wallet.svg",
  products: "https://illustrations.popsy.co/amber/shopping-bags.svg",
  inventory: "https://illustrations.popsy.co/amber/empty-box.svg",
  payouts: "https://illustrations.popsy.co/amber/wallet.svg",
  store: "https://illustrations.popsy.co/amber/shopping-bags.svg",
  promote: "https://illustrations.popsy.co/amber/shopping-bags.svg",
  empty: "https://illustrations.popsy.co/gray/empty-box.svg",
};

const FallbackIcon = ({ type }) => {
  const colors = { orders: "text-blue-500", wishlist: "text-rose-500", messages: "text-cyan-500", notifications: "text-amber-500", disputes: "text-orange-500", profile: "text-indigo-500", sell: "text-violet-500", earnings: "text-emerald-500", empty: "text-gray-400" };
  return (
    <div className={`w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center ${colors[type] || colors.empty}`}>
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
      </svg>
    </div>
  );
};

export default function PageHero({ title, description, illustration = "empty", guide }) {
  const [imgError, setImgError] = useState(false);
  const src = typeof illustration === "string" ? illustrations[illustration] || illustrations.empty : illustration;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-5 mb-6 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/60">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{description}</p>}
        {guide && <p className="text-xs text-gray-500 mt-2 italic border-l-2 border-[#1790d7]/30 pl-2">{guide}</p>}
      </div>
      <div className="flex-shrink-0 w-full lg:w-40 h-24 lg:h-20 relative rounded-lg overflow-hidden bg-gray-100/50 flex items-center justify-center">
        {!imgError && src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt=""
            className="w-full h-full object-contain p-4"
            onError={() => setImgError(true)}
          />
        ) : (
          <FallbackIcon type={illustration} />
        )}
      </div>
    </div>
  );
}
