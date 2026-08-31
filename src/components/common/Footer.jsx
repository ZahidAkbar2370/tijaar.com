"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  Apple,
  PlayCircle,
  Heart,
  Shield,
  BadgeCheck,
  HelpCircle,
  Store,
  MessageCircle,
  ShoppingCart,
  Info,
  FileText,
  MailQuestion,
  Grid3X3,
  Monitor,
  Shirt,
  Home,
  Dumbbell,
  BookOpen,
  RotateCcw,
  Package,
  Tag,
} from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { optimizeImageUrl, IMAGE_WIDTHS } from "@/lib/imageOptimize";

// Footer data: about/tagline and contact come from useSiteSettings(); socialLinks from topbar_social_links

const quickLinks = [
  { name: "How It Works", link: "/how-it-works", icon: HelpCircle, color: "text-purple-400" },
  { name: "Become a Seller", link: "/sellers", icon: Store, color: "text-emerald-400" },
  { name: "FAQs", link: "/faqs", icon: MessageCircle, color: "text-amber-400" },
  { name: "Shop", link: "/shop", icon: ShoppingCart, color: "text-blue-400" },
  { name: "Flash Deals", link: "/flash-deals", icon: Tag, color: "text-rose-400" },
];

const companyLinks = [
  { name: "About Us", link: "/about", icon: Info, color: "text-cyan-400" },
  { name: "Blogs", link: "/blogs", icon: FileText, color: "text-pink-400" },
  { name: "Contact Us", link: "/contact", icon: MailQuestion, color: "text-green-400" },
  { name: "All Categories", link: "/all-categories", icon: Grid3X3, color: "text-orange-400" },
];

const categories = [
  { name: "Electronics", link: "/category/electronics", icon: Monitor, color: "text-blue-400" },
  { name: "Fashion", link: "/category/fashion", icon: Shirt, color: "text-pink-400" },
  { name: "Home & Living", link: "/category/home-living", icon: Home, color: "text-amber-400" },
  { name: "Sports", link: "/category/sports", icon: Dumbbell, color: "text-red-400" },
  { name: "Books", link: "/category/books", icon: BookOpen, color: "text-emerald-400" },
];

const support = [
  { name: "Help Center", link: "/help", icon: HelpCircle, color: "text-blue-400" },
  { name: "Returns & Refunds", link: "/returns-refunds", icon: RotateCcw, color: "text-orange-400" },
  { name: "Shipping Info", link: "/shipping", icon: Package, color: "text-green-400" },
];

export default function Footer() {
  const settings = useSiteSettings();
  const data = {
    logo: settings.site_logo_url || "/images/tijaar-logo.png",
    logoAlt: settings.site_logo_alt,
    about: settings.footer_tagline || settings.site_tagline || "Tijaar is the #1 multi-seller marketplace connecting buyers and sellers. Shop with confidence from verified sellers Pakistan.",
    contact: {
      address: settings.contact_address || "Pakistan",
      phone: settings.contact_phone || "+92 300 1234567",
      email: settings.contact_email || "support@tijaar.com",
      support_hours: "24/7",
    },
    socialLinks: settings.topbar_social_links || { facebook: "#", twitter: "#", instagram: "#", youtube: "#" },
  };
  const contact = data.contact || {};
  const socialMap = {
    facebook: { icon: Facebook, color: "hover:bg-blue-600", label: "Tijaar on Facebook" },
    twitter: { icon: Twitter, color: "hover:bg-sky-500", label: "Tijaar on X (Twitter)" },
    instagram: { icon: Instagram, color: "hover:bg-pink-600", label: "Tijaar on Instagram" },
    youtube: { icon: Youtube, color: "hover:bg-red-600", label: "Tijaar on YouTube" },
  };
  const socialLinks = Object.entries(data.socialLinks || {})
    .filter(([key, url]) => url && socialMap[key])
    .map(([key, link]) => ({ ...socialMap[key], link, key }));

  return (
    <footer className="bg-gray-900 text-white">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Main footer grid: brand full-width on mobile, then 2×2 link columns */}
        <div className="py-8 sm:py-12 lg:py-14 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-6 sm:gap-8 lg:gap-8">
          {/* About & Contact */}
          <div className="col-span-2 lg:col-span-2">
            {data.logo && (
              <Link href="/" className="site-logo-wrap site-logo-wrap--footer inline-block mb-3 sm:mb-5">
                <img
                  src={optimizeImageUrl(data.logo, { width: IMAGE_WIDTHS.siteLogo })}
                  alt={resolveImageAlt(data.logoAlt, IMAGE_ALT_FALLBACKS.siteLogo)}
                  width={140}
                  height={44}
                  sizes="140px"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.target.src !== "/images/tijaar-logo.png") {
                      e.target.src = "/images/tijaar-logo.png";
                    }
                  }}
                />
              </Link>
            )}
            {data.about && (
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm mb-4 sm:mb-6">{data.about}</p>
            )}
            <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg shrink-0">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                  </div>
                  <span className="text-xs sm:text-sm">{contact.phone}</span>
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg shrink-0">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                  </div>
                  <span className="text-xs sm:text-sm break-all">{contact.email}</span>
                </a>
              )}
            </div>
            {socialLinks.length > 0 ? (
              <div className="flex gap-1.5 sm:gap-2 min-h-[36px] sm:min-h-[44px]">
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.key}
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className={`p-2 sm:p-2.5 bg-white/5 rounded-lg text-gray-400 hover:text-white ${s.color} transition-all duration-300`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-2 min-h-[36px] sm:min-h-[44px]" aria-hidden />
            )}
          </div>

          {/* Quick Links */}
          <div className="min-w-0">
            <h3 className="text-[11px] sm:text-sm font-semibold uppercase tracking-wider text-white/90 mb-2.5 sm:mb-4 flex items-center gap-1 sm:gap-2">
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4db3e8] shrink-0" />
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <li key={i}>
                    <Link
                      href={link.link}
                      className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-200 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2.5"
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${link.color}`} />
                      <span className="truncate">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company */}
          <div className="min-w-0">
            <h3 className="text-[11px] sm:text-sm font-semibold uppercase tracking-wider text-white/90 mb-2.5 sm:mb-4 flex items-center gap-1 sm:gap-2">
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4db3e8] shrink-0" />
              Company
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {companyLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <li key={i}>
                    <Link
                      href={link.link}
                      className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-200 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2.5"
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${link.color}`} />
                      <span className="truncate">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Categories */}
          <div className="min-w-0">
            <h3 className="text-[11px] sm:text-sm font-semibold uppercase tracking-wider text-white/90 mb-2.5 sm:mb-4 flex items-center gap-1 sm:gap-2">
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4db3e8] shrink-0" />
              Categories
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {categories.map((link, i) => {
                const Icon = link.icon;
                return (
                  <li key={i}>
                    <Link
                      href={link.link}
                      className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-200 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2.5"
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${link.color}`} />
                      <span className="truncate">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support */}
          <div className="min-w-0">
            <h3 className="text-[11px] sm:text-sm font-semibold uppercase tracking-wider text-white/90 mb-2.5 sm:mb-4 flex items-center gap-1 sm:gap-2">
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4db3e8] shrink-0" />
              Support
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {support.map((link, i) => {
                const Icon = link.icon;
                return (
                  <li key={i}>
                    <Link
                      href={link.link}
                      className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-200 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2.5"
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${link.color}`} />
                      <span className="truncate">{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* App download & trust */}
        <div className="py-5 sm:py-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <span className="text-gray-400 text-xs sm:text-sm shrink-0">Download Our App:</span>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 w-full sm:w-auto">
                <a href="#" aria-label="Download Tijaar on the App Store" className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors border border-white/10">
                  <Apple className="w-4 h-4 sm:w-6 sm:h-6 text-gray-300 shrink-0" aria-hidden="true" />
                  <div className="text-left min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 leading-tight">Download on</p>
                    <p className="text-xs sm:text-sm font-medium text-white leading-tight">App Store</p>
                  </div>
                </a>
                <a href="#" aria-label="Get Tijaar on Google Play" className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors border border-white/10">
                  <PlayCircle className="w-4 h-4 sm:w-6 sm:h-6 text-gray-300 shrink-0" aria-hidden="true" />
                  <div className="text-left min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-gray-400 leading-tight">Get it on</p>
                    <p className="text-xs sm:text-sm font-medium text-white leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-between sm:justify-center gap-2 sm:gap-6 w-full sm:w-auto">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-sm">
                <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                <span className="leading-tight text-center sm:text-left">Verified Sellers</span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-sm">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
                <span className="leading-tight text-center sm:text-left">Secure Payments</span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-gray-400 text-[10px] sm:text-sm">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                <span className="leading-tight text-center sm:text-left">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright row */}
        <div className="py-4 sm:py-5 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-gray-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} Tijaar. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6">
              <Link href="/terms" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookie-policy" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
