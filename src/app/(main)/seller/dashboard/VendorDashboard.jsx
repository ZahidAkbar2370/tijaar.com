"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import {
  Package,
  Store,
  User,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ArrowRight,
  MapPin,
  PlusCircle,
  Bell,
  BadgeCheck,
  History,
  Zap,
  Clock,
} from "lucide-react";
import { sellerStoreApi, sellerOrdersApi, sellerProductsApi, payoutsApi, promotionApi, notificationApi } from "@/lib/api";
import PageHero from "@/components/customer/PageHero";
import { DashboardContentSkeleton } from "@/components/common/PageSkeleton";

export default function VendorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [hasStore, setHasStore] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    earningsNet: 0,
    loading: true,
  });
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [alertUnreadCount, setAlertUnreadCount] = useState(0);

  useEffect(() => {
    sellerStoreApi
      .get()
      .then((res) => {
        setHasStore(res.has_store);
        setStoreData(res.store);
      })
      .catch(() => setHasStore(false));
  }, []);

  useEffect(() => {
    promotionApi.mySubscriptions().then((r) => {
      setActiveSubscriptions((r.subscriptions || []).filter((s) => s.is_active));
    }).catch(() => setActiveSubscriptions([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    notificationApi.unreadCount().then((r) => setAlertUnreadCount(r?.count ?? 0)).catch(() => setAlertUnreadCount(0));
  }, [user]);

  useEffect(() => {
    if (hasStore !== true) return;
    Promise.all([
      sellerProductsApi.list().catch(() => ({ products: [] })),
      sellerOrdersApi.list().catch(() => ({ orders: [], pagination: { total: 0 } })),
      payoutsApi.earnings().catch(() => ({ net: 0 })),
    ]).then(([productsRes, ordersRes, earnRes]) => {
      const products = productsRes.products || [];
      const orders = ordersRes.orders || [];
      const pagination = ordersRes.pagination || {};
      setStats({
        products: products.length,
        orders: pagination.total ?? orders.length,
        earningsNet: earnRes.net ?? 0,
        loading: false,
      });
    });
  }, [hasStore]);

  if (hasStore === null || (hasStore === true && stats.loading)) {
    return <DashboardContentSkeleton />;
  }

  if (hasStore === false) {
    return (
      <div className="space-y-6">
        <PageHero
          title="Create Your Store"
          description="Set up your store to start selling on Tijaar. Add your store details, logo, contact info, and policies in just a few minutes. Your store will be visible to buyers once created."
          illustration="store"
        />
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/seller/create-store")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Create Store
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const actionCards = [
    { name: "Store & Profile", href: "/seller/store-details", desc: "Manage store details and account", icon: MapPin, gradient: "from-teal-50 to-cyan-50", border: "border-teal-200/60", iconBg: "bg-teal-100", iconColor: "text-teal-600", accent: "text-teal-600" },
    { name: "Add Product", href: "/seller/products/add", desc: "List new products to sell", icon: PlusCircle, gradient: "from-indigo-50 to-violet-50", border: "border-indigo-200/60", iconBg: "bg-indigo-100", iconColor: "text-indigo-600", accent: "text-indigo-600" },
    { name: "KYC Verification", href: "/seller/kyc", desc: "Get Verified badge", icon: BadgeCheck, gradient: "from-emerald-50 to-teal-50", border: "border-emerald-200/60", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", accent: "text-emerald-600" },
    { name: "Notification Settings", href: "/seller/profile", desc: "Control emails and alerts", icon: Bell, gradient: "from-pink-50 to-rose-50", border: "border-pink-200/60", iconBg: "bg-pink-100", iconColor: "text-pink-600", accent: "text-pink-600" },
  ];

  const statCards = [
    { label: "Products", value: stats.products, href: "/seller/products", icon: Package, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Orders", value: stats.orders, href: "/seller/orders", icon: ShoppingBag, iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
    { label: "Earnings", value: `PKR ${(stats.earningsNet || 0).toLocaleString()}`, href: "/seller/payouts", icon: DollarSign, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", isPrice: true },
  ];

  const quickLinks = [
    { name: "Disputes", href: "/seller/disputes", icon: AlertCircle },
    { name: "Transaction History", href: "/seller/transactions", icon: History },
    { name: "Profile", href: "/seller/profile", icon: User },
  ];
  const DisputesIcon = quickLinks[0].icon;
  const HistoryIcon = quickLinks[1].icon;
  const ProfileIcon = quickLinks[2].icon;

  return (
    <div className="space-y-6">
      <PageHero
        title={`Welcome back, ${user?.name || "Seller"}`}
        description="Here's your store overview. Manage products, fulfill orders, and track earnings."
        illustration="products"
        guide="Tip: Use the cards below to jump to Products, Orders, or Payouts. Open the menu on the left (arrow at top) for full navigation."
      />

      {/* Alert module: visible alerts summary with link to full list */}
      <Link
        href="/seller/notifications"
        className="flex items-center justify-between gap-4 p-4 rounded-xl border-2 border-amber-200/80 bg-amber-50/80 hover:bg-amber-100/80 hover:border-[#1790d7]/40 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="flex w-10 h-10 items-center justify-center rounded-xl bg-[#1790d7]/15 text-[#1790d7]">
            <Bell className="w-5 h-5" strokeWidth={2} />
          </span>
          <div>
            <p className="font-semibold text-gray-900">Alerts</p>
            <p className="text-sm text-gray-600">
              {alertUnreadCount > 0
                ? `${alertUnreadCount} unread notification${alertUnreadCount !== 1 ? "s" : ""}`
                : "New orders, payouts, and low stock alerts appear here"}
            </p>
          </div>
        </div>
        <span className="text-[#1790d7] font-medium text-sm shrink-0">
          {alertUnreadCount > 0 ? "View alerts" : "View all"} →
        </span>
      </Link>

      {activeSubscriptions.length > 0 && (
        <div className="space-y-2">
          {activeSubscriptions.map((sub) => (
            <Link
              key={sub.id}
              href="/seller/packages"
              className={`block rounded-xl border-2 p-4 flex items-center justify-between gap-4 transition ${
                sub.days_remaining <= 7
                  ? "border-[#1790d7] bg-[#1790d7]/5 hover:bg-[#1790d7]/10"
                  : "border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/80"
              }`}
            >
              <div className="flex items-center gap-3">
                {sub.days_remaining <= 7 ? (
                  <AlertCircle className="w-6 h-6 text-[#1790d7] shrink-0" />
                ) : (
                  <Zap className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{sub.package_name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {sub.days_remaining === 0
                      ? "Expires today"
                      : sub.days_remaining === 1
                      ? "1 day remaining"
                      : `${sub.days_remaining} days remaining`}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-[#1790d7]">View Packages →</span>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl skeleton-shimmer" />
            ))
          : statCards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="group flex flex-col p-4 rounded-xl border border-gray-200/80 bg-white hover:border-[#1790d7]/40 hover:shadow-md hover:shadow-[#1790d7]/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <span className={`flex w-8 h-8 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}>
                    <card.icon className="w-4 h-4" strokeWidth={2} />
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1790d7] transition-colors" />
                </div>
                <p className={`mt-2 text-lg font-semibold tabular-nums ${card.isPrice ? "text-emerald-600" : "text-gray-900"}`}>
                  {card.value}
                </p>
                <p className="text-xs font-medium text-gray-500">{card.label}</p>
              </Link>
            ))}
      </div>

      {/* Row 1: 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actionCards.slice(0, 3).map((card) => (
          <Link
            key={card.name}
            href={card.href}
            className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${card.gradient} border ${card.border} hover:shadow-md transition-all duration-200 group`}
          >
            <span className={`flex w-10 h-10 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}>
              <card.icon className="w-5 h-5" strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{card.name}</p>
              <p className="text-xs text-gray-600">{card.desc}</p>
            </div>
            <span className={`${card.accent} font-medium text-sm group-hover:translate-x-1 transition-transform`}>
              Go <ChevronRight className="w-4 h-4 inline" />
            </span>
          </Link>
        ))}
      </div>

      {/* Row 2: 2 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actionCards[3] && (() => {
          const card = actionCards[3];
          const Icon = card.icon;
          return (
            <Link
              key={card.name}
              href={card.href}
              className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${card.gradient} border ${card.border} hover:shadow-md transition-all duration-200 group`}
            >
              <span className={`flex w-10 h-10 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{card.name}</p>
                <p className="text-xs text-gray-600">{card.desc}</p>
              </div>
              <span className={`${card.accent} font-medium text-sm group-hover:translate-x-1 transition-transform`}>
                Go <ChevronRight className="w-4 h-4 inline" />
              </span>
            </Link>
          );
        })()}
        <Link
          href={quickLinks[0].href}
          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200/80 bg-white hover:border-[#1790d7]/40 hover:shadow-md transition-all duration-200 group"
        >
          <span className="flex w-10 h-10 items-center justify-center rounded-xl bg-[#1790d7]/10 text-[#1790d7] group-hover:bg-[#1790d7]/15 transition-colors">
            <DisputesIcon className="w-5 h-5" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">{quickLinks[0].name}</p>
            <p className="text-xs text-gray-500">View & manage</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1790d7]" />
        </Link>
      </div>

      {/* Row 3: 1 card */}
      <div className="grid grid-cols-1 gap-3">
        <Link
          href={quickLinks[1].href}
          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200/80 bg-white hover:border-[#1790d7]/40 hover:shadow-md transition-all duration-200 group"
        >
          <span className="flex w-10 h-10 items-center justify-center rounded-xl bg-[#1790d7]/10 text-[#1790d7] group-hover:bg-[#1790d7]/15 transition-colors">
            <HistoryIcon className="w-5 h-5" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">{quickLinks[1].name}</p>
            <p className="text-xs text-gray-500">View & manage</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1790d7]" />
        </Link>
      </div>

      {/* Row 4: 1 card */}
      <div className="grid grid-cols-1 gap-3">
        <Link
          href={quickLinks[2].href}
          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200/80 bg-white hover:border-[#1790d7]/40 hover:shadow-md transition-all duration-200 group"
        >
          <span className="flex w-10 h-10 items-center justify-center rounded-xl bg-[#1790d7]/10 text-[#1790d7] group-hover:bg-[#1790d7]/15 transition-colors">
            <ProfileIcon className="w-5 h-5" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">{quickLinks[2].name}</p>
            <p className="text-xs text-gray-500">View & manage</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1790d7]" />
        </Link>
      </div>
    </div>
  );
}
