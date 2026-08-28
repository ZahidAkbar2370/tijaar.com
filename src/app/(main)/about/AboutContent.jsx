"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  ChevronRight,
  Globe,
  Package,
  Users,
  Store,
  ShoppingCart,
  Shield,
  Heart,
  Truck,
  Award,
} from "lucide-react";
import { cmsApi, getBackendBaseUrl } from "@/lib/api";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { useSeoH1 } from "@/hooks/useSeoH1";

const VALUE_ICONS = [Shield, Heart, Truck, Award];

/* Static fallback when CMS has no About sections. */
const STATIC = {
  hero: {
    title: "About Us",
    subtitle:
      "We're building the future of e-commerce by connecting customers with trusted sellers worldwide.",
  },
  mission: {
    title: "Our Mission",
    paragraphs: [
      "We're building a trusted multi-vendor marketplace where quality, transparency, and customer service come first. Our goal is to make buying and selling simple, secure, and enjoyable for everyone—whether you're looking for the best deal or growing your business online.",
      "We verify every seller so you can shop with confidence. Buyer protection and secure payments are at the heart of what we do. From order issues to seller growth, we support both buyers and sellers every step of the way.",
    ],
  },
  stats: [
    { icon: Package, color: "bg-violet-500", number: "100K+", label: "Active Products" },
    { icon: Users, color: "bg-orange-500", number: "50K+", label: "Happy Customers" },
    { icon: Store, color: "bg-[#1790d7]", number: "2.5K+", label: "Verified Vendors" },
    { icon: ShoppingCart, color: "bg-emerald-500", number: "200K+", label: "Orders Delivered" },
  ],
  values: [
    { icon: Shield, title: "Trust & Security", description: "We verify every seller so you can shop with confidence. Buyer protection and secure payments are at the heart of what we do." },
    { icon: Heart, title: "Customer First", description: "Your experience matters. We listen, improve, and put your needs at the center of every decision we make." },
    { icon: Truck, title: "Fast Delivery", description: "We work with sellers to ensure reliable shipping and tracking so your orders arrive on time, every time." },
    { icon: Award, title: "Quality Assured", description: "We uphold high standards for listings and service. We work with sellers to keep the marketplace reliable and professional." },
  ],
  journey: [
    { year: "2020", title: "Platform Launch", description: "Started with a vision to connect buyers and sellers in a trusted, easy-to-use marketplace." },
    { year: "2021", title: "10K Customers", description: "Reached our first 10,000 happy customers and expanded our seller base." },
    { year: "2022", title: "Expansion", description: "Grew to thousands of sellers and buyers. Launched in new regions." },
    { year: "2023", title: "Market Leader", description: "Became one of the leading multi-seller marketplaces in the region." },
    { year: "2026", title: "Today", description: "Verified sellers, secure payments, and 24/7 support. We're just getting started." },
  ],
  team: [
    { name: "Ava Walker", role: "Co-Founder & CEO", image_path: null },
    { name: "Nathan Hunt", role: "Co-Founder & CTO", image_path: null },
    { name: "Sofia Chen", role: "Head of Product", image_path: null },
    { name: "Marcus Reid", role: "Head of Operations", image_path: null },
  ],
  cta: {
    heading: "Join Us on Our Journey",
    text: "Whether you're a customer looking for great deals or a seller ready to grow your business, we'd love to have you. Join thousands of others who trust Tijaar.",
    primaryText: "Become a Seller",
    primaryHref: "/sellers",
    secondaryText: "Contact Us",
    secondaryHref: "/contact",
  },
};

const STAT_ICON_MAP = {
  package: { Icon: Package, color: "bg-violet-500" },
  users: { Icon: Users, color: "bg-orange-500" },
  store: { Icon: Store, color: "bg-[#1790d7]" },
  cart: { Icon: ShoppingCart, color: "bg-emerald-500" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function buildDataFromCms(page) {
  const s = page?.sections || {};
  const baseUrl = typeof getBackendBaseUrl === "function" ? getBackendBaseUrl() : (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "") || "";
  const hero = {
    title: page?.banner_title || page?.title || STATIC.hero.title,
    subtitle: page?.banner_subtitle || STATIC.hero.subtitle,
  };
  const missionDesc = s.mission?.description ?? "";
  const mission = {
    title: s.mission?.title || STATIC.mission.title,
    paragraphs: missionDesc ? missionDesc.split(/\r\n|\n/).filter((p) => p.trim()) : STATIC.mission.paragraphs,
  };
  const statsRaw = Array.isArray(s.stats) && s.stats.length > 0 ? s.stats : STATIC.stats;
  const stats = statsRaw.map((item) => {
    if (typeof item !== "object" || item === null) return item;
    if (item.Icon || (item.icon && typeof item.icon !== "string")) {
      return { ...item, Icon: item.Icon ?? item.icon, color: item.color || "bg-[#1790d7]" };
    }
    const key = (item.icon || "package").toLowerCase();
    const { Icon, color } = STAT_ICON_MAP[key] || STAT_ICON_MAP.package;
    return { Icon, color, number: item.number || "", label: item.label || "" };
  });
  const valuesRaw = Array.isArray(s.values) && s.values.length > 0 ? s.values : STATIC.values;
  const values = valuesRaw.map((v, i) => {
    if (typeof v === "object" && v !== null) {
      const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
      return { icon: Icon, title: v.title || "", description: v.description || "" };
    }
    return v;
  });
  const journey = Array.isArray(s.journey) && s.journey.length > 0 ? s.journey : STATIC.journey;
  const teamRaw = Array.isArray(s.team) && s.team.length > 0 ? s.team : STATIC.team;
  const team = teamRaw.map((t) => ({
    name: t?.name ?? "",
    role: t?.role ?? "",
    image_path: t?.image_path ?? null,
    imageUrl: t?.image_path ? `${baseUrl}/${t.image_path.replace(/^\//, "")}` : null,
  }));
  const cta = {
    heading: s.cta?.heading ?? STATIC.cta.heading,
    text: s.cta?.text ?? STATIC.cta.text,
    primaryText: s.cta?.primary_text ?? STATIC.cta.primaryText,
    primaryHref: s.cta?.primary_url ?? STATIC.cta.primaryHref,
    secondaryText: s.cta?.secondary_text ?? STATIC.cta.secondaryText,
    secondaryHref: s.cta?.secondary_url ?? STATIC.cta.secondaryHref,
  };
  return { hero, mission, stats, values, journey, team, cta };
}

export default function AboutContent() {
  const [cmsPage, setCmsPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const data = useMemo(() => {
    if (cmsPage?.page?.sections) {
      return buildDataFromCms(cmsPage.page);
    }
    if (cmsPage?.page?.banner_title || cmsPage?.page?.banner_subtitle) {
      return {
        ...buildDataFromCms(null),
        hero: {
          title: cmsPage.page.banner_title || cmsPage.page.title || STATIC.hero.title,
          subtitle: cmsPage.page.banner_subtitle || STATIC.hero.subtitle,
        },
      };
    }
    return {
      hero: STATIC.hero,
      mission: STATIC.mission,
      stats: STATIC.stats,
      values: STATIC.values,
      journey: STATIC.journey,
      team: STATIC.team.map((t) => ({ ...t, imageUrl: null })),
      cta: STATIC.cta,
    };
  }, [cmsPage]);

  const h1 = useSeoH1("cms", { title: data.hero.title, fallback: data.hero.title });

  useEffect(() => {
    let cancelled = false;
    cmsApi
      .page("about")
      .then((res) => {
        if (!cancelled) setCmsPage(res);
      })
      .catch(() => {
        if (!cancelled) setCmsPage(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

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
            <span className="text-gray-900 font-medium">{data.hero.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#1790d7] py-16 lg:py-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight">
            {h1}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-white/95 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            {data.hero.subtitle}
          </motion.p>
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16 lg:space-y-20">
        {/* Our Mission */}
        {(data.mission.paragraphs?.length > 0 || data.mission.title) && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/80 p-8 lg:p-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#1790d7]/10 flex items-center justify-center">
                <Globe className="w-7 h-7 text-[#1790d7]" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-[#0d6fa8] mb-6">{data.mission.title}</h2>
                <div className="space-y-4 text-gray-600 text-base lg:text-lg leading-relaxed">
                  {data.mission.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Statistics */}
        {data.stats?.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {data.stats.map((s, i) => {
              const StatIcon = s.Icon ?? s.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/80 p-6 lg:p-8 flex flex-col items-center text-center"
                >
                  <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mb-4`}>
                    {StatIcon && <StatIcon className="w-6 h-6 text-white" />}
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-[#1790d7]">{s.number}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </motion.div>
              );
            })}
          </motion.section>
        )}

        {/* Our Values */}
        {data.values?.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Our Values</h2>
            <p className="mt-2 text-gray-500 text-lg">The principles that guide everything we do</p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.values.filter((v) => v.title || v.description).map((v, i) => (
                    <motion.div
                      key={i}
                  variants={itemVariants}
                  className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/80 p-6 lg:p-8 text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#1790d7]/10 flex items-center justify-center mb-4">
                    <v.icon className="w-5 h-5 text-[#1790d7]" />
                      </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{v.description}</p>
                    </motion.div>
                  ))}
                </div>
          </motion.section>
        )}

        {/* Our Journey */}
        {data.journey?.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Our Journey</h2>
            <p className="mt-2 text-gray-500 text-lg">Key milestones in our growth</p>
            <div className="mt-12 relative">
              <div className="absolute left-[19px] sm:left-6 top-0 bottom-0 w-0.5 bg-[#1790d7]/30 rounded-full" />
              <div className="space-y-8">
                {data.journey.map((j, i) => (
                  <motion.div key={i} variants={itemVariants} className="relative flex gap-4 sm:gap-6 text-left">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1790d7] border-4 border-white shadow-md flex items-center justify-center z-10">
                      <span className="text-white text-xs font-bold hidden sm:inline">{String(j.year || "").slice(-2)}</span>
                    </div>
                    <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/80 p-6 pl-6 sm:pl-8">
                      <p className="text-[#1790d7] font-bold text-lg">{j.year}</p>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">{j.title}</h3>
                      <p className="text-gray-600 mt-2">{j.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#1790d7] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8 lg:p-12 text-center"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-white">{data.cta.heading}</h2>
          <p className="mt-4 text-white/95 text-lg max-w-2xl mx-auto leading-relaxed">{data.cta.text}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={data.cta.primaryHref}
              className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-[#1790d7] font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              {data.cta.primaryText}
            </Link>
            <Link
              href={data.cta.secondaryHref}
              className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              {data.cta.secondaryText}
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
