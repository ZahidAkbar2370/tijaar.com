"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Home,
  ChevronRight,
  Search,
  CreditCard,
  Truck,
  UserPlus,
  Package,
  Wallet,
  Shield,
  ArrowRight,
  CheckCircle2,
  User,
  Building2,
} from "lucide-react";
import { cmsApi } from "@/lib/api";
import { useSeoH1 } from "@/hooks/useSeoH1";

const DEFAULT_HERO = {
  title: "How Tijaar Works",
  subtitle:
    "Whether you want to shop, sell items as a customer, or run a business store — Tijaar makes it simple, secure, and built for Pakistan.",
};

const BUYER_ICONS = [Search, CreditCard, Truck];
const CUSTOMER_SELLER_ICONS = [UserPlus, Package, Wallet];

const FALLBACK_BUYER_STEPS = [
  {
    title: "Browse & Discover",
    description:
      "Search products, explore categories, and compare offers from verified sellers across Pakistan.",
    features: ["Smart search & filters", "Verified sellers", "Flash deals & promotions"],
  },
  {
    title: "Secure Checkout",
    description:
      "Add to cart and pay with COD, JazzCash, Easypaisa, card, or wallet — with buyer protection on every order.",
    features: ["Multiple payment options", "Buyer protection", "Order tracking"],
  },
  {
    title: "Receive & Review",
    description:
      "Get fast courier delivery, track your order, and leave reviews to help the community shop with confidence.",
    features: ["Courier delivery", "Order support", "Easy returns & disputes"],
  },
];

const FALLBACK_CUSTOMER_SELLER_STEPS = [
  {
    title: "Enable Seller Mode",
    description:
      "Sign in, complete your profile, and start selling as a customer — no full store setup required.",
    features: ["Quick registration", "Profile verification", "Sell from your account"],
  },
  {
    title: "List Your Items",
    description:
      "Upload photos, set price and details, choose a category, and publish your listing to reach buyers nationwide.",
    features: ["Photo uploads", "Category & pricing", "Listing promotions"],
  },
  {
    title: "Manage Orders & Payouts",
    description:
      "Accept orders, ship with integrated couriers, and receive earnings in your Tijaar wallet after delivery.",
    features: ["Order dashboard", "Courier labels", "Wallet payouts"],
  },
];

const SELLER_TYPE_CARDS = [
  {
    id: "private",
    badge: "Private Seller",
    icon: User,
    accent: "from-violet-500 to-purple-600",
    light: "bg-violet-50 border-violet-100 text-violet-800",
    title: "Sell as an Individual",
    description:
      "Perfect for personal items, pre-owned goods, or side income. List products without opening a full business store.",
    points: [
      "List items from your customer account",
      "KYC verification for trust & payouts",
      "Free listing limits, then affordable fees",
      "Ship via Tijaar courier partners",
    ],
    cta: "Start Selling",
    href: "/customer/sell",
  },
  {
    id: "business",
    badge: "Business Seller",
    icon: Building2,
    accent: "from-amber-500 to-orange-500",
    light: "bg-amber-50 border-amber-100 text-amber-900",
    title: "Run a Professional Store",
    description:
      "Build your brand with a dedicated store, product catalog, variants, and business seller tools.",
    points: [
      "Create your branded store page",
      "Business KYC & verified store badge",
      "Full catalog, variants & inventory",
      "Seller dashboard, analytics & promotions",
    ],
    cta: "Become a Business Seller",
    href: "/seller/register",
  },
];

function StepCard({ step, index, icon: Icon, accentClass }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(23,144,215,0.12)] hover:border-[#1790d7]/20 transition-all duration-300 h-full"
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className={`relative shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${accentClass} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-7 h-7 text-white" />
          <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-gray-900 text-xs font-bold flex items-center justify-center shadow-md border border-gray-100">
            {index + 1}
          </span>
        </div>
        <div className="min-w-0 pt-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1790d7] mb-1">
            Step {index + 1}
          </p>
          <h3 className="text-lg lg:text-xl font-bold text-gray-900 leading-snug">{step.title}</h3>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-5">{step.description || step.desc}</p>
      {step.features?.length > 0 && (
        <ul className="space-y-2">
          {step.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function JourneySection({ id, badge, title, subtitle, steps, icons, accentClass, ctaText, ctaUrl, reversed }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:gap-14 items-start`}>
        <div className="lg:w-[34%] lg:sticky lg:top-24">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${badge.className}`}>
            {badge.label}
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{subtitle}</p>
          {ctaText && ctaUrl && (
            <Link
              href={ctaUrl}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg hover:opacity-95 transition-all"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 w-full">
          {steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              index={i}
              icon={icons[i % icons.length]}
              accentClass={accentClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HowItWorksContent() {
  const [cmsPage, setCmsPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    cmsApi
      .page("how-it-works")
      .then((res) => {
        if (!cancelled) setCmsPage(res.page);
      })
      .catch(() => {
        if (!cancelled) setCmsPage(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hero = useMemo(() => {
    if (!cmsPage) return DEFAULT_HERO;
    return {
      title: cmsPage.banner_title || cmsPage.title || DEFAULT_HERO.title,
      subtitle: cmsPage.banner_subtitle || DEFAULT_HERO.subtitle,
    };
  }, [cmsPage]);

  const h1 = useSeoH1("cms", { title: hero.title, fallback: hero.title });
  const sections = cmsPage?.sections ?? {};

  const buyerSteps = useMemo(() => {
    const steps = sections.buyer_steps?.length ? sections.buyer_steps : FALLBACK_BUYER_STEPS;
    return steps.map((step, i) => ({
      ...FALLBACK_BUYER_STEPS[i],
      ...step,
      title: step.title ?? FALLBACK_BUYER_STEPS[i]?.title ?? "",
      description: step.description ?? FALLBACK_BUYER_STEPS[i]?.description ?? "",
    }));
  }, [sections.buyer_steps]);

  const customerSellerSteps = useMemo(() => {
    const steps = sections.seller_steps?.length ? sections.seller_steps : FALLBACK_CUSTOMER_SELLER_STEPS;
    return steps.map((step, i) => ({
      ...FALLBACK_CUSTOMER_SELLER_STEPS[i],
      ...step,
      title: step.title ?? FALLBACK_CUSTOMER_SELLER_STEPS[i]?.title ?? "",
      description: step.description ?? FALLBACK_CUSTOMER_SELLER_STEPS[i]?.description ?? "",
    }));
  }, [sections.seller_steps]);

  const buyerHeading = sections.buyer_heading ?? "Customer as Buyer";
  const buyerSubtitle =
    sections.buyer_subtitle ??
    "Shop from verified sellers with secure payments, buyer protection, and fast delivery across Pakistan.";
  const buyerCtaText = sections.buyer_cta_text ?? "Start Shopping";
  const buyerCtaUrl = sections.buyer_cta_url ?? "/shop";

  const customerSellerHeading = sections.seller_heading ?? "Customer as Seller";
  const customerSellerSubtitle =
    sections.seller_subtitle ??
    "Turn items into income. List products from your account, manage orders, and get paid — without running a full store.";
  const customerSellerCtaText = sections.seller_cta_text ?? "Sell an Item";
  const customerSellerCtaUrl = sections.seller_cta_url ?? "/customer/sell";

  const sellerTypesHeading = sections.seller_types_heading ?? "Business & Private Seller";
  const sellerTypesSubtitle =
    sections.seller_types_subtitle ??
    "Choose the path that fits you — sell individually as a private seller or scale with a professional business store.";

  const trustItems = sections.trust_items?.length
    ? sections.trust_items
    : [{ label: "Verified Sellers" }, { label: "Secure Payments" }, { label: "Fast Courier Delivery" }];
  const trustText =
    sections.trust_text ??
    "Tijaar is Pakistan's multi-seller marketplace. We verify sellers, protect buyers, and make buying and selling simple and secure.";
  const trustLinks = sections.trust_links?.length
    ? sections.trust_links
    : [
        { text: "FAQs", url: "/faqs" },
        { text: "Contact Us", url: "/contact" },
      ];

  const navItems = [
    { id: "buyer", label: "Buyer" },
    { id: "customer-seller", label: "Customer Seller" },
    { id: "seller-types", label: "Business / Private" },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50/80">
        <div className="w-10 h-10 border-2 border-[#1790d7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="flex items-center gap-1 hover:text-[#1790d7] transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
            <span className="text-gray-900 font-medium">{hero.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1790d7] to-[#4db3e8] py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/15 text-white/95 text-sm font-semibold mb-5 border border-white/20"
          >
            Simple · Secure · Nationwide
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4"
          >
            {h1}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="text-white/95 text-base lg:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {hero.subtitle}
          </motion.p>

          {/* Quick jump nav */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex flex-wrap justify-center gap-2 mt-8"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium border border-white/20 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 space-y-20 lg:space-y-28">
        <JourneySection
          id="buyer"
          badge={{ label: "Customer as Buyer", className: "bg-sky-50 border border-sky-100 text-sky-800" }}
          title={buyerHeading}
          subtitle={buyerSubtitle}
          steps={buyerSteps}
          icons={BUYER_ICONS}
          accentClass="from-[#1790d7] to-[#4db3e8]"
          ctaText={buyerCtaText}
          ctaUrl={buyerCtaUrl}
        />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <JourneySection
          id="customer-seller"
          badge={{ label: "Customer as Seller", className: "bg-emerald-50 border border-emerald-100 text-emerald-800" }}
          title={customerSellerHeading}
          subtitle={customerSellerSubtitle}
          steps={customerSellerSteps}
          icons={CUSTOMER_SELLER_ICONS}
          accentClass="from-emerald-500 to-teal-500"
          ctaText={customerSellerCtaText}
          ctaUrl={customerSellerCtaUrl}
          reversed
        />

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Business & Private Seller */}
        <section id="seller-types" className="scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-800 text-xs font-semibold mb-4">
              Seller Types
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{sellerTypesHeading}</h2>
            <p className="text-gray-600 leading-relaxed">{sellerTypesSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {SELLER_TYPE_CARDS.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col h-full hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow"
                >
                  <div className={`px-6 py-4 border-b border-gray-100 ${card.light}`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center shadow-md`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-sm uppercase tracking-wide">{card.badge}</span>
                    </div>
                  </div>
                  <div className="p-6 lg:p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">{card.description}</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {card.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-[#1790d7] shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={card.href}
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white font-semibold hover:opacity-95 transition-opacity"
                    >
                      {card.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Trust bar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {trustItems.map((item, i) => {
              const icons = [Shield, CreditCard, Truck];
              const Icon = icons[i % icons.length];
              return (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50/80 border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1790d7]/10 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-[#1790d7]" />
                  </div>
                  <span className="font-semibold text-gray-900">{item.label || "—"}</span>
                </div>
              );
            })}
          </div>
          {trustText && (
            <p className="text-center text-gray-600 max-w-2xl mx-auto leading-relaxed">{trustText}</p>
          )}
          {trustLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {trustLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.url || "#"}
                  className="inline-flex items-center gap-1 text-[#1790d7] font-semibold hover:underline"
                >
                  {link.text || "Learn more"}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
