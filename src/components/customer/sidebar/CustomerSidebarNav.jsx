"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import {
  accountNav,
  buyerNav,
  settingsNav,
  buildSellerNav,
  isNavActive,
} from "./navConfig";

function SectionLabel({ children, collapsed }) {
  if (collapsed) {
    return <div className="my-2 mx-auto w-6 border-t border-gray-200" aria-hidden="true" />;
  }
  return (
    <p className="px-3 pt-3 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
      {children}
    </p>
  );
}

function SectionDivider({ collapsed }) {
  if (collapsed) {
    return <div className="my-3 mx-auto w-8 border-t border-gray-200" aria-hidden="true" />;
  }
  return (
    <div className="my-3 mx-3 border-t border-gray-200" role="separator" aria-hidden="true" />
  );
}

export default function CustomerSidebarNav({
  pathname,
  user,
  collapsed = false,
  onNavigate,
  onLogout,
}) {
  const sellerNav = buildSellerNav(user);
  const allPaths = [...accountNav, ...buyerNav, ...sellerNav, ...settingsNav].map((i) => i.path);

  const renderLink = (item) => {
    const active = isNavActive(pathname, item.path, allPaths);
    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={onNavigate}
        title={collapsed ? item.name : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
          collapsed ? "justify-center" : ""
        } ${
          active
            ? "bg-[#1790d7]/10 text-[#1790d7] font-semibold shadow-sm"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <span
          className={`flex shrink-0 w-9 h-9 items-center justify-center rounded-lg ${
            active ? "bg-[#1790d7]/20 text-[#1790d7]" : `${item.iconBg} ${item.iconColor}`
          }`}
        >
          <item.icon className="w-5 h-5" strokeWidth={2} />
        </span>
        {!collapsed && item.name}
      </Link>
    );
  };

  return (
    <>
      {accountNav.map(renderLink)}

      <SectionLabel collapsed={collapsed}>Buyer</SectionLabel>
      {buyerNav.map(renderLink)}

      <SectionDivider collapsed={collapsed} />

      <SectionLabel collapsed={collapsed}>Seller</SectionLabel>
      {sellerNav.map(renderLink)}

      <SectionDivider collapsed={collapsed} />

      <SectionLabel collapsed={collapsed}>Settings</SectionLabel>
      {settingsNav.map(renderLink)}

      <button
        type="button"
        onClick={onLogout}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 mt-2 ${
          collapsed ? "justify-center" : ""
        }`}
        title={collapsed ? "Logout" : undefined}
      >
        <span className="flex shrink-0 w-9 h-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <LogOut className="w-5 h-5" strokeWidth={2} />
        </span>
        {!collapsed && "Logout"}
      </button>
    </>
  );
}
