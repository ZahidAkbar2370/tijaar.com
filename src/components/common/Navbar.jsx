"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  StoreIcon,
  HeartIcon,
  ShoppingBag,
  X,
  Menu,
  User,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  Tag,
  DollarSign,
  Bell,
  Store,
  History,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import AdvancedSearchBar from "./AdvancedSearchBar";
import NotificationDropdown from "./NotificationDropdown";
import CartSidebar from "./CartSidebar";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { optimizeImageUrl, IMAGE_WIDTHS, LOCAL_LOGO_PNG, LOCAL_LOGO_WEBP } from "@/lib/imageOptimize";

const navLinks = [
  { name: "Sellers", path: "/sellers", icon: StoreIcon },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount, setIsCartOpen } = useCart();
  const { wishlistItems } = useWishlist();
  const { site_logo_url, site_name, site_logo_alt } = useSiteSettings();
  const cartCount = getCartCount();
  const wishlistCount = wishlistItems.length;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/login");
  };

  const handleAvatarClick = () => {
    if (isAuthenticated) {
      const path = user?.role === "seller" ? "/seller/dashboard" : "/customer/dashboard";
      router.push(path);
    }
  };

  const profilePath = isAuthenticated
    ? user?.role === "seller"
      ? "/seller/profile"
      : "/customer/profile"
    : "/login";

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="w-full flex justify-between items-center gap-4 py-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="site-logo-wrap site-logo-wrap--header shrink-0 hover:opacity-90 transition-opacity">
          <img
            src={optimizeImageUrl(site_logo_url || LOCAL_LOGO_WEBP, { width: IMAGE_WIDTHS.siteLogo, quality: 85 })}
            alt={resolveImageAlt(site_logo_alt, site_name || IMAGE_ALT_FALLBACKS.siteLogo)}
            width={140}
            height={36}
            sizes="140px"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              const img = e.target;
              if (!img.src.includes(LOCAL_LOGO_PNG) && !img.src.endsWith(LOCAL_LOGO_WEBP)) {
                img.src = LOCAL_LOGO_WEBP;
                return;
              }
              if (!img.src.includes(LOCAL_LOGO_PNG)) {
                img.src = LOCAL_LOGO_PNG;
              }
            }}
          />
        </Link>

        <AdvancedSearchBar />

        <nav className="hidden lg:flex items-center gap-4 text-gray-600 font-medium shrink-0">
          {navLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.path}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:text-[#1790d7] min-w-[52px]"
            >
              <link.icon strokeWidth={1.5} size={26} />
              <span className="text-[10px] font-medium uppercase tracking-wide">{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4 shrink-0">
          {isAuthenticated && (user?.role === "customer" || user?.role === "seller") && (
            <div className="relative group">
              <div className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 hover:bg-gray-50 rounded-lg transition-all duration-200 text-gray-600 hover:text-[#1790d7] cursor-pointer min-w-[52px]">
                <Bell strokeWidth={1.5} size={26} />
                <span className="text-[10px] font-medium uppercase tracking-wide">Alerts</span>
                <NotificationDropdown />
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 hover:bg-gray-50 rounded-lg transition-all duration-200 text-gray-600 hover:text-[#1790d7] min-w-[52px]"
          >
            <ShoppingBag strokeWidth={1.5} size={26} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-1/4 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <Link
            href={
              isAuthenticated
                ? user?.role === "customer"
                  ? "/customer/wishlist"
                  : "/seller/dashboard"
                : "/login"
            }
            className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 hover:bg-gray-50 rounded-lg transition-all duration-200 text-gray-600 hover:text-[#1790d7] min-w-[52px]"
          >
            <HeartIcon strokeWidth={1.5} size={26} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-1/4 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleLogout}
                className="p-2.5 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-600"
                title="Logout"
              >
                <LogOut strokeWidth={2} size={21} />
              </button>
              <div className="relative group">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:shadow-lg hover:scale-105 transition-all overflow-hidden border-2 border-white shadow-md"
                  style={{ background: "linear-gradient(135deg, #1790d7, #4db3e8)" }}
                  aria-label="Account menu"
                >
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={resolveImageAlt(user?.avatar_alt, user?.name || IMAGE_ALT_FALLBACKS.avatar)} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || "U"
                  )}
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[9999]">
                  {user?.role === "customer" ? (
                    <>
                      <Link href="/customer/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard size={18} />
                        Dashboard
                      </Link>
                      <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Buyer</p>
                      <Link href="/customer/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Package size={18} />
                        My Orders
                      </Link>
                      <Link href="/customer/transactions" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <History size={18} />
                        Transactions
                      </Link>
                      <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Seller</p>
                      <Link href="/customer/sell" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Tag size={18} />
                        Sell an Item
                      </Link>
                      <Link href="/customer/listings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Store size={18} />
                        My Listings
                      </Link>
                      <Link href="/customer/listings/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <ShoppingBag size={18} />
                        Selling Orders
                      </Link>
                      <Link href="/customer/earnings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <DollarSign size={18} />
                        Earnings
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link href="/customer/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <User size={18} />
                          Profile
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/seller/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard size={18} />
                        Dashboard
                      </Link>
                      <Link href="/seller/products" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Package size={18} />
                        My Products
                      </Link>
                      <Link href="/seller/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={18} />
                        Profile
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <User size={18} />
              <span className="text-sm">Login</span>
            </Link>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1 sm:gap-2">
          <Link
            href={profilePath}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isAuthenticated ? "Profile" : "Login"}
            onClick={() => setIsOpen(false)}
          >
            {isAuthenticated && user?.avatar_url ? (
              <span className="block w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={user.avatar_url}
                  alt={resolveImageAlt(user?.avatar_alt, user?.name || IMAGE_ALT_FALLBACKS.avatar)}
                  className="w-full h-full object-cover"
                />
              </span>
            ) : (
              <User strokeWidth={1.5} size={22} className="text-gray-700" aria-hidden="true" />
            )}
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2"
            aria-label={cartCount > 0 ? `Open cart, ${cartCount} items` : "Open cart"}
          >
            <ShoppingBag strokeWidth={1.5} size={22} className="text-gray-700" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1790d7] text-white text-xs rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 overflow-hidden menu-panel-enter">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <link.icon strokeWidth={1.5} size={20} />
                    <span className="font-medium">{link.name}</span>
                  </div>
                  <ChevronRight size={18} />
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100 mt-4 flex gap-3">
                <Link
                  href={
                    isAuthenticated
                      ? user?.role === "customer"
                        ? "/customer/dashboard?tab=wishlist"
                        : "/seller/dashboard"
                      : "/login"
                  }
                  onClick={() => setIsOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors relative"
                >
                  <HeartIcon size={18} />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white font-medium"
                  >
                    <User size={18} />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      <CartSidebar />
    </header>
  );
}
