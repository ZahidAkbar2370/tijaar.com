import {
  LayoutDashboard,
  Package,
  Heart,
  History,
  Tag,
  Store,
  ShoppingBag,
  DollarSign,
  User,
  MapPin,
  Bell,
  KeyRound,
  Monitor,
  MessageSquare,
  CreditCard,
  Wallet,
  Sparkles,
} from "lucide-react";
/** Top account links (before Buyer / Seller). */
export const accountNav = [
  {
    name: "Dashboard",
    path: "/customer/dashboard",
    icon: LayoutDashboard,
    iconBg: "bg-[#1790d7]/10",
    iconColor: "text-[#1790d7]",
  },
];

export const buyerNav = [
  {
    name: "My Orders",
    path: "/customer/orders",
    icon: Package,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    name: "Wishlist",
    path: "/customer/wishlist",
    icon: Heart,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    name: "Transactions",
    path: "/customer/transactions",
    icon: History,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    name: "Wallet",
    path: "/customer/wallet",
    icon: Wallet,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
  {
    name: "Messages",
    path: "/customer/messages",
    icon: MessageSquare,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
  },
];

export const sellerNavBase = [
  {
    name: "Sell an Item",
    path: "/customer/sell",
    icon: Tag,
    iconBg: "bg-[#1790d7]/10",
    iconColor: "text-[#1790d7]",
  },
  {
    name: "My Listings",
    path: "/customer/listings",
    icon: Store,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    name: "Selling Orders",
    path: "/customer/listings/orders",
    icon: ShoppingBag,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    name: "Earnings",
    path: "/customer/earnings",
    icon: DollarSign,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    name: "Messages",
    path: "/customer/messages",
    icon: MessageSquare,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
  },
];

/** Account settings — shown after Seller, below a divider. */
export const settingsNav = [
  {
    name: "Profile",
    path: "/customer/profile",
    icon: User,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    name: "Addresses",
    path: "/customer/addresses",
    icon: MapPin,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    name: "Promotion Packages",
    path: "/customer/promotion-packages",
    icon: Sparkles,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    name: "Saved Cards",
    path: "/customer/saved-cards",
    icon: CreditCard,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
  },
  {
    name: "Enable Alerts",
    path: "/customer/notifications/preferences",
    icon: Bell,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    name: "Change Password",
    path: "/customer/account",
    icon: KeyRound,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    name: "Active Sessions",
    path: "/customer/sessions",
    icon: Monitor,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
];

export function buildSellerNav(user) {
  return [...sellerNavBase];
}

export function isNavActive(pathname, itemPath, allPaths) {
  if (!pathname) return false;
  if (pathname === itemPath) return true;
  if (!pathname.startsWith(`${itemPath}/`)) return false;
  const longerMatch = allPaths.some(
    (p) => p !== itemPath && p.startsWith(itemPath) && pathname.startsWith(p)
  );
  return !longerMatch;
}
