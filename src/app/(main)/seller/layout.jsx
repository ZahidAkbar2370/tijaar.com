"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  User,
  LogOut,
  ShoppingBag,
  DollarSign,
  Store,
  AlertTriangle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Bell,
  Zap,
  Tag,
  MessageSquare,
  KeyRound,
  Monitor,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { sellerStoreApi } from "@/lib/api";
import ChatFAB from "@/components/chat/ChatFAB";

const dashboardNav = {
  name: "Dashboard",
  path: "/seller/dashboard",
  icon: LayoutDashboard,
  iconBg: "bg-[#1790d7]/10",
  iconColor: "text-[#1790d7]",
};

const sellerSectionNav = [
  { name: "My Products", path: "/seller/products", icon: Package, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { name: "Inventory", path: "/seller/inventory", icon: AlertTriangle, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { name: "Orders", path: "/seller/orders", icon: ShoppingBag, iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
  { name: "Flash Deals", path: "/seller/flash-deals", icon: Tag, iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  { name: "Packages", path: "/seller/packages", icon: Zap, iconBg: "bg-[#1790d7]/10", iconColor: "text-[#1790d7]" },
  { name: "Earnings & Payouts", path: "/seller/payouts", icon: DollarSign, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { name: "Messages", path: "/seller/messages", icon: MessageSquare, iconBg: "bg-cyan-100", iconColor: "text-cyan-700" },
];

const settingsSectionNav = [
  { name: "Profile", path: "/seller/profile", icon: User, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
  { name: "Store Info", path: "/seller/store-details", icon: Store, iconBg: "bg-teal-100", iconColor: "text-teal-600" },
  { name: "Change Password", path: "/seller/account", icon: KeyRound, iconBg: "bg-amber-100", iconColor: "text-amber-700" },
  { name: "Enable Alerts", path: "/seller/notifications/preferences", icon: Bell, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  { name: "Active Sessions", path: "/seller/sessions", icon: Monitor, iconBg: "bg-slate-100", iconColor: "text-slate-600" },
  { name: "KYC", path: "/seller/kyc", icon: BadgeCheck, iconBg: "bg-teal-100", iconColor: "text-teal-600" },
];

const privateSellerRoutes = [
  "/seller/dashboard",
  "/seller/products",
  "/seller/flash-deals",
  "/seller/inventory",
  "/seller/orders",
  "/seller/notifications",
  "/seller/disputes",
  "/seller/payouts",
  "/seller/profile",
  "/seller/store-details",
  "/seller/kyc",
  "/seller/transactions",
  "/seller/create-store",
  "/seller/account",
  "/seller/messages",
  "/seller/promote",
  "/seller/packages",
  "/seller/wallet",
  "/seller/saved-cards",
  "/seller/sessions",
  "/seller/verify-phone",
  "/seller/verify-whatsapp",
  "/seller/addresses",
];

function isPrivateSellerRoute(path) {
  return privateSellerRoutes.some((r) => path === r || path.startsWith(r + "/"));
}

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
  return <div className="my-3 mx-3 border-t border-gray-200" role="separator" aria-hidden="true" />;
}

function isNavActive(pathname, itemPath, allPaths) {
  if (!pathname) return false;
  if (pathname === itemPath) return true;
  if (!pathname.startsWith(`${itemPath}/`)) return false;
  const longerMatch = allPaths.some(
    (p) => p !== itemPath && p.startsWith(itemPath) && pathname.startsWith(p)
  );
  return !longerMatch;
}

export default function VendorAccountLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [hasStore, setHasStore] = useState(null);

  const isPublicStorePage = !isPrivateSellerRoute(pathname);

  useEffect(() => {
    if (isPublicStorePage) return;
    sellerStoreApi.get().then((r) => setHasStore(r.has_store)).catch(() => setHasStore(false));
  }, [isPublicStorePage]);

  const createStoreItem =
    hasStore === false
      ? { name: "Create Store", path: "/seller/create-store", icon: Store, iconBg: "bg-teal-100", iconColor: "text-teal-600" }
      : null;

  const allNavPaths = [
    dashboardNav.path,
    ...(createStoreItem ? [createStoreItem.path] : []),
    ...sellerSectionNav.map((i) => i.path),
    ...settingsSectionNav.map((i) => i.path),
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("seller_sidebar_collapsed");
    if (saved === "1") setSidebarCollapsed(true);
    else if (saved === "0") setSidebarCollapsed(false);
  }, []);
  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    if (typeof window !== "undefined") localStorage.setItem("seller_sidebar_collapsed", next ? "1" : "0");
  };

  const renderLink = (item, collapsed) => {
    const active = isNavActive(pathname, item.path, allNavPaths);
    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={() => setSidebarOpen(false)}
        title={collapsed ? item.name : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
          collapsed ? "justify-center" : ""
        } ${
          active
            ? "bg-[#1790d7]/10 text-[#1790d7] font-semibold shadow-sm"
            : "text-gray-700 hover:bg-gray-50"
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

  const navLinks = (collapsed = false) => (
    <>
      {renderLink(dashboardNav, collapsed)}
      {createStoreItem && renderLink(createStoreItem, collapsed)}

      <SectionDivider collapsed={collapsed} />
      <SectionLabel collapsed={collapsed}>Seller</SectionLabel>
      {sellerSectionNav.map((item) => renderLink(item, collapsed))}

      <SectionDivider collapsed={collapsed} />
      <SectionLabel collapsed={collapsed}>Settings</SectionLabel>
      {settingsSectionNav.map((item) => renderLink(item, collapsed))}

      <button
        type="button"
        onClick={() => {
          logout();
          setSidebarOpen(false);
        }}
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

  if (isPublicStorePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 pl-[10px] pr-4 sm:pr-6 lg:pr-8 py-6 lg:py-8 bg-gradient-to-br from-slate-50/80 to-gray-50/50 min-h-[60vh]">
      <div className="lg:hidden flex items-center gap-2 w-full">
        <Link
          href="/seller/profile"
          className="inline-flex items-center justify-center w-11 h-11 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 hover:text-[#1790d7] transition-all"
          aria-label="Profile"
          title="Profile"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <User size={20} />
          )}
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm font-medium text-gray-700 hover:bg-gray-50 flex-1 min-w-0"
        >
          <Menu size={20} />
          Menu
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Menu</span>
          <button type="button" onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#1790d7]/5 to-white">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#1790d7]/25" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center text-white font-bold shadow-md">
                {user?.name?.charAt(0) || "S"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "Seller"}</p>
              <p className="text-xs text-[#1790d7] font-medium">Seller Account</p>
            </div>
          </div>
        </div>
        <nav className="p-3 flex-1 overflow-y-auto">{navLinks(false)}</nav>
      </aside>

      <aside className={`flex-shrink-0 hidden lg:block transition-all duration-300 ${sidebarCollapsed ? "w-[72px]" : "w-56 xl:w-64"}`}>
        <div className="sticky top-24 bg-white/95 backdrop-blur rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden mb-8 flex flex-col max-h-[calc(100vh-7rem)]">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex items-center justify-center gap-2 py-2 border-b border-gray-100 text-gray-500 hover:bg-gray-50 text-xs shrink-0"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}
          </button>
          <div className={`border-b border-gray-100 bg-gradient-to-r from-[#1790d7]/5 to-white ${sidebarCollapsed ? "p-2" : "p-5"}`}>
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#1790d7]/25 shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center text-white font-bold shadow-md shrink-0">
                  {user?.name?.charAt(0) || "S"}
                </div>
              )}
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "Seller"}</p>
                  <p className="text-xs text-[#1790d7] font-medium flex items-center gap-1">
                    Seller {user?.is_seller_verified && <span className="text-emerald-600" title="Verified">✓</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
          <nav className="p-3 flex-1 overflow-y-auto">
            <div className={sidebarCollapsed ? "flex flex-col items-center" : ""}>{navLinks(sidebarCollapsed)}</div>
          </nav>
        </div>
      </aside>
      <div className="flex-1 min-w-0 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-6 lg:p-8">
        {children}
      </div>
      {user && <ChatFAB />}
    </div>
  );
}
