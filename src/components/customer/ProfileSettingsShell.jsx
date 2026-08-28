"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, ExternalLink } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { sellerStoreApi } from "@/lib/api";
import PageHero from "@/components/customer/PageHero";

/**
 * Page chrome for profile/settings content.
 * Top pill menus removed — navigation lives in the customer left sidebar Settings section.
 */
export default function ProfileSettingsShell({
  children,
  showHero = true,
  title = "Profile & Settings",
  description = "Manage your account details and preferences from the Settings menu.",
}) {
  const pathname = usePathname() || "";
  const { user } = useAuth();
  const isSeller = user?.role === "seller" || pathname.startsWith("/seller");
  const [storeSlug, setStoreSlug] = useState(null);

  useEffect(() => {
    if (!isSeller) {
      setStoreSlug(null);
      return;
    }
    let cancelled = false;
    sellerStoreApi
      .get()
      .then((r) => {
        if (cancelled) return;
        setStoreSlug(r?.has_store && r?.store?.slug ? r.store.slug : null);
      })
      .catch(() => {
        if (!cancelled) setStoreSlug(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isSeller]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {showHero && (
        <PageHero
          title={title}
          description={description}
          illustration="profile"
          guide="Tip: Use Settings in the left menu to switch between profile, addresses, and security."
        />
      )}

      {isSeller && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {storeSlug && (
            <a
              href={`/seller/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm bg-white border border-gray-200 text-gray-800 hover:border-[#1790d7]/40 hover:text-[#1790d7]"
            >
              <ExternalLink className="w-4 h-4" />
              View store
            </a>
          )}
          <Link
            href="/seller/store-details"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm bg-[#1790d7] hover:bg-[#1277b8] text-white border border-[#1790d7]"
          >
            <Store className="w-4 h-4" />
            Store details
          </Link>
        </div>
      )}

      {children}
    </div>
  );
}
