"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Home, ChevronRight, ShoppingBag, Store, Shield, MessageCircle, CreditCard, Truck } from "lucide-react";
import { cmsApi } from "@/lib/api";
import { useSeoH1 } from "@/hooks/useSeoH1";

const DEFAULT_HERO = {
  title: "How Tijaar Works",
  subtitle: "Buy from trusted sellers or start selling yourself. Simple, secure, and built for Pakistan.",
};

const BUYER_ICONS = [ShoppingBag, CreditCard, Truck];
const SELLER_ICONS = [Store, ShoppingBag, MessageCircle];
const TRUST_ICONS = [Shield, CreditCard, Truck];

const FALLBACK_BUYER_STEPS = [
  { title: "Browse & Search", description: "Explore products from verified sellers. Use categories, filters, and search to find what you need." },
  { title: "Secure Checkout", description: "Add to cart and pay securely. We support multiple payment methods and protect your transactions." },
  { title: "Fast Delivery", description: "Sellers ship directly. Track your order and get support from the seller or our team if needed." },
];
const FALLBACK_SELLER_STEPS = [
  { title: "Create Your Store", description: "Sign up as a seller, complete verification, and set up your store profile and policies." },
  { title: "List Products", description: "Add products with images, descriptions, and variants. Set prices and manage inventory." },
  { title: "Sell & Grow", description: "Receive orders, communicate with buyers, and get paid. Use promotions to boost visibility." },
];

export default function HowItWorksPage() {
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
      icon: BUYER_ICONS[i % BUYER_ICONS.length],
      title: step.title ?? "",
      desc: step.description ?? "",
    }));
  }, [sections.buyer_steps]);
  const sellerSteps = useMemo(() => {
    const steps = sections.seller_steps?.length ? sections.seller_steps : FALLBACK_SELLER_STEPS;
    return steps.map((step, i) => ({
      icon: SELLER_ICONS[i % SELLER_ICONS.length],
      title: step.title ?? "",
      desc: step.description ?? "",
    }));
  }, [sections.seller_steps]);
  const buyerHeading = sections.buyer_heading ?? "For Buyers";
  const buyerSubtitle = sections.buyer_subtitle ?? "Shop with confidence from verified sellers. Secure payments and buyer protection on every order.";
  const buyerCtaText = sections.buyer_cta_text ?? "Start Shopping";
  const buyerCtaUrl = sections.buyer_cta_url ?? "/shop";
  const sellerHeading = sections.seller_heading ?? "For Sellers";
  const sellerSubtitle = sections.seller_subtitle ?? "Reach millions of buyers. List products, manage orders, and get paid. We handle the platform; you focus on selling.";
  const sellerCtaText = sections.seller_cta_text ?? "Become a seller";
  const sellerCtaUrl = sections.seller_cta_url ?? "/sellers";
  const trustItems = sections.trust_items?.length ? sections.trust_items : [{ label: "Verified Sellers" }, { label: "Secure Payments" }, { label: "Reliable Shipping" }];
  const trustText = sections.trust_text ?? "Tijaar is the #1 multi-seller marketplace for Pakistan and beyond. We verify sellers, protect buyers, and make buying and selling simple and secure.";
  const trustLinks = sections.trust_links?.length ? sections.trust_links : [{ text: "FAQs", url: "/faqs" }, { text: "Contact Us", url: "/contact" }];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="w-full px-4 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#1790d7] flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
            <span className="text-gray-900 font-medium">{hero.title}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-16 lg:py-20">
        <div className="w-full px-4 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-center">
            {h1}
          </h1>
          <p className="text-white/90 text-lg text-center max-w-2xl mx-auto">
            {hero.subtitle}
          </p>
        </div>
      </div>

      <div className="w-full px-4 lg:px-8 py-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center">{buyerHeading}</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            {buyerSubtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {buyerSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
                >
                  <div className="inline-flex flex-col items-center justify-center px-5 py-4 rounded-2xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white mb-6">
                    <Icon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-semibold text-white/90">Step {i + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
          {(buyerCtaText || buyerCtaUrl) && (
            <div className="text-center mt-10">
              <Link href={buyerCtaUrl} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg">
                {buyerCtaText || "Start Shopping"}
              </Link>
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center">{sellerHeading}</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            {sellerSubtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sellerSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
                >
                  <div className="inline-flex flex-col items-center justify-center px-5 py-4 rounded-2xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white mb-6">
                    <Icon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-semibold text-white/90">Step {i + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
          {(sellerCtaText || sellerCtaUrl) && (
            <div className="text-center mt-10">
              <Link href={sellerCtaUrl} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg">
                {sellerCtaText || "Become a seller"}
              </Link>
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-100 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-center gap-6">
            {trustItems.map((item, i) => {
              const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
              return (
                <div key={i} className="flex items-center gap-3 text-gray-700">
                  <Icon className="w-8 h-8 text-[#1790d7]" />
                  <span className="font-semibold">{item.label || "—"}</span>
                </div>
              );
            })}
          </div>
          {trustText && (
            <p className="text-center text-gray-600 mt-6 max-w-2xl mx-auto">
              {trustText}
            </p>
          )}
          {trustLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {trustLinks.map((link, i) => (
                <Link key={i} href={link.url || "#"} className="text-[#1790d7] font-semibold hover:underline">
                  {link.text || "Link"}
                </Link>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
