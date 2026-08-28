"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { useWishlist } from "@/context/WishlistContext";
import { useMarket } from "@/context/MarketContext";
import { orderApi, disputeApi, payoutsApi, privateListingsApi, walletApi } from "@/lib/api";
import {
  Package,
  Heart,
  User,
  Tag,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  ChevronRight,
  MapPin,
  Phone,
  Bell,
  Wallet,
} from "lucide-react";
import { DashboardContentSkeleton } from "@/components/common/PageSkeleton";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const { formatPrice } = useMarket();
  const [stats, setStats] = useState({
    orders: 0,
    disputes: 0,
    listings: 0,
    earningsNet: 0,
    walletBalance: 0,
    loading: true,
  });

  useEffect(() => {
    Promise.all([
      orderApi.list().catch(() => ({ orders: [], pagination: { total: 0 } })),
      disputeApi.list().catch(() => ({ disputes: [] })),
      privateListingsApi.list().catch(() => ({ listings: [] })),
      payoutsApi.earnings().catch(() => ({ net: 0 })),
      walletApi.balance().catch(() => ({ wallet: { balance: 0 } })),
    ]).then(([ordersRes, dispRes, listRes, earnRes, walletRes]) => {
      const orders = ordersRes.orders || [];
      const pagination = ordersRes.pagination || {};
      setStats({
        orders: pagination.total ?? orders.length,
        disputes: (dispRes.disputes || []).length,
        listings: (listRes.listings || listRes.products || []).length,
        earningsNet: earnRes.net ?? 0,
        walletBalance: walletRes.wallet?.balance ?? walletRes.balance ?? 0,
        loading: false,
      });
    });
  }, []);

  if (stats.loading) {
    return <DashboardContentSkeleton />;
  }

  const buyerStatCards = [
    {
      label: "Orders",
      value: stats.orders,
      href: "/customer/orders",
      icon: Package,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Wishlist",
      value: wishlistItems.length,
      href: "/customer/wishlist",
      icon: Heart,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
    {
      label: "Disputes",
      value: stats.disputes,
      href: "/customer/disputes",
      icon: AlertCircle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Wallet",
      value: formatPrice(stats.walletBalance),
      href: "/customer/wallet",
      icon: Wallet,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
  ];

  const sellerStatCards = [
    {
      label: "Listings",
      value: stats.listings,
      href: "/customer/listings",
      icon: Tag,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      label: "Earnings",
      value: formatPrice(stats.earningsNet),
      href: "/customer/earnings",
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      isPrice: true,
    },
  ];

  const quickLinks = [
    { name: "Profile & Settings", href: "/customer/profile", icon: User },
    { name: "Continue Shopping", href: "/shop", icon: ShoppingBag },
  ];

  const actionCards = [
    { name: "Change Address", href: "/customer/addresses", desc: "Manage shipping addresses", icon: MapPin, gradient: "from-teal-50 to-cyan-50", border: "border-teal-200/60", iconBg: "bg-teal-100", iconColor: "text-teal-600", accent: "text-teal-600" },
    { name: "Phone Number", href: "/customer/profile", desc: "Verify or update your contact number", icon: Phone, gradient: "from-indigo-50 to-violet-50", border: "border-indigo-200/60", iconBg: "bg-indigo-100", iconColor: "text-indigo-600", accent: "text-indigo-600" },
    { name: "Notification Settings", href: "/customer/notifications/preferences", desc: "Control emails & alerts", icon: Bell, gradient: "from-pink-50 to-rose-50", border: "border-pink-200/60", iconBg: "bg-pink-100", iconColor: "text-pink-600", accent: "text-pink-600" },
  ];

  const renderStatCard = (card) => (
    <Link
      key={card.label}
      href={card.href}
      className="group flex flex-col p-4 rounded-xl border border-gray-200/80 bg-white hover:border-[#1790d7]/30 hover:shadow-md hover:shadow-[#1790d7]/5 transition-all duration-200"
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
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Welcome back, {user?.name || "Customer"}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here&apos;s your account overview</p>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Buyer</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {buyerStatCards.map(renderStatCard)}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Seller</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {sellerStatCards.map(renderStatCard)}
        </div>
      </div>

      {/* Address, Phone, Notifications - direct action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actionCards.map((card) => (
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
              Manage <ChevronRight className="w-4 h-4 inline" />
            </span>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200/80 bg-white hover:border-[#1790d7]/30 hover:shadow-md transition-all duration-200 group"
          >
            <span className="flex w-10 h-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 group-hover:bg-[#1790d7]/10 group-hover:text-[#1790d7] transition-colors">
              <link.icon className="w-5 h-5" strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{link.name}</p>
              <p className="text-xs text-gray-500">
                {link.href === "/customer/profile" ? "Manage your account" : "Browse products"}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1790d7]" />
          </Link>
        ))}
      </div>

      {/* Sell CTA - compact */}
      <Link
        href="/customer/sell"
        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 hover:shadow-md transition-all duration-200 group"
      >
        <span className="flex w-10 h-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Tag className="w-5 h-5" strokeWidth={2} />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Sell an Item</p>
          <p className="text-sm text-gray-600">List items without a shop • No store required</p>
        </div>
        <span className="text-amber-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
          Create listing <ChevronRight className="w-4 h-4 inline" />
        </span>
      </Link>
    </div>
  );
}
