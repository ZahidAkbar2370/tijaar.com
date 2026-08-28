"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Headphones,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Music2,
} from "lucide-react";
import { cmsApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { useSeoH1 } from "@/hooks/useSeoH1";
import { isValidEmail } from "@/lib/validators";

const STATIC = {
  hero: {
    title: "Get in Touch",
    subtitle:
      "Have a question or need help? We're here for you 24/7. Reach out and we'll get back to you as soon as possible.",
  },
  contact_cards: [
    { type: "phone", label: "Phone", value: "+971 50 123 4567", subtext: "Call us anytime" },
    { type: "email", label: "Email", value: "support@tijaar.com", subtext: "Send us an email" },
    { type: "address", label: "Address", value: "Dubai, United Arab Emirates", subtext: "Visit our office" },
  ],
  map: {
    heading: "Our Location",
    address: "Dubai, United Arab Emirates",
    embed_url: "",
  },
  form_title: "Send us a Message",
  support: {
    title: "Need Immediate Help?",
    description:
      "Our support team is here to assist you with any questions or concerns. Reach out via phone or email and we'll respond as soon as possible.",
    phone_label: "Call Us",
    phone_value: "+971 50 123 4567",
    email_label: "Email Us",
    email_value: "support@tijaar.com",
  },
  social: {
    title: "Follow Us",
    subtext: "Stay connected with us on social media",
    links: [
      { platform: "facebook", url: "" },
      { platform: "twitter", url: "" },
      { platform: "instagram", url: "" },
      { platform: "youtube", url: "" },
      { platform: "tiktok", url: "" },
    ],
  },
};

const CARD_ICONS = {
  phone: { Icon: Phone, bg: "bg-emerald-500" },
  email: { Icon: Mail, bg: "bg-[#1790d7]" },
  address: { Icon: MapPin, bg: "bg-violet-500" },
};

const SOCIAL_ICONS = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
};

function buildDataFromCms(page) {
  const s = page?.sections || {};
  const hero = {
    title: page?.banner_title || page?.title || STATIC.hero.title,
    subtitle: page?.banner_subtitle || STATIC.hero.subtitle,
  };
  const contact_cards = Array.isArray(s.contact_cards) && s.contact_cards.length > 0
    ? s.contact_cards
    : STATIC.contact_cards;
  const map = {
    heading: s.map?.heading ?? STATIC.map.heading,
    address: s.map?.address ?? STATIC.map.address,
    embed_url: s.map?.embed_url ?? STATIC.map.embed_url,
  };
  const form_title = s.form_title ?? STATIC.form_title;
  const support = {
    title: s.support?.title ?? STATIC.support.title,
    description: s.support?.description ?? STATIC.support.description,
    phone_label: s.support?.phone_label ?? STATIC.support.phone_label,
    phone_value: s.support?.phone_value ?? STATIC.support.phone_value,
    email_label: s.support?.email_label ?? STATIC.support.email_label,
    email_value: s.support?.email_value ?? STATIC.support.email_value,
  };
  const social = {
    title: s.social?.title ?? STATIC.social.title,
    subtext: s.social?.subtext ?? STATIC.social.subtext,
    links: Array.isArray(s.social?.links) && s.social.links.length > 0 ? s.social.links : STATIC.social.links,
  };
  return { hero, contact_cards, map, form_title, support, social };
}

export default function ContactContent() {
  const [cmsPage, setCmsPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const { showSuccess, showError } = useSnackbar();

  const data = useMemo(() => {
    if (cmsPage?.page?.sections) return buildDataFromCms(cmsPage.page);
    if (cmsPage?.page) {
      const d = buildDataFromCms(null);
      d.hero = {
        title: cmsPage.page.banner_title || cmsPage.page.title || STATIC.hero.title,
        subtitle: cmsPage.page.banner_subtitle || STATIC.hero.subtitle,
      };
      return d;
    }
    return {
      hero: STATIC.hero,
      contact_cards: STATIC.contact_cards,
      map: STATIC.map,
      form_title: STATIC.form_title,
      support: STATIC.support,
      social: STATIC.social,
    };
  }, [cmsPage]);

  const h1 = useSeoH1("cms", { title: data.hero.title, fallback: data.hero.title });

  useEffect(() => {
    let cancelled = false;
    cmsApi
      .page("contact")
      .then((res) => { if (!cancelled) setCmsPage(res); })
      .catch(() => { if (!cancelled) setCmsPage(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) {
      showError?.("Enter a valid email address");
      return;
    }
    setSending(true);
    try {
      await cmsApi.contact(form);
      showSuccess?.("Message sent! We'll get back to you soon.");
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

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
            <span className="text-gray-900 font-medium">Contact Us</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1790d7] to-[#4db3e8] py-16 lg:py-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight"
          >
            {h1}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 text-white/95 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            {data.hero.subtitle}
          </motion.p>
        </div>
      </section>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12 lg:space-y-16">
        {/* Contact info cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {data.contact_cards.map((card, i) => {
            const { Icon, bg } = CARD_ICONS[card.type] || CARD_ICONS.email;
            const href = card.type === "phone" ? `tel:${card.value}` : card.type === "email" ? `mailto:${card.value}` : null;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/80 p-6 lg:p-8 text-center"
              >
                <div className={`inline-flex w-12 h-12 rounded-xl ${bg} items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{card.label}</h3>
                {href ? (
                  <a href={href} className="text-lg font-semibold text-[#1790d7] hover:underline block">
                    {card.value}
                  </a>
                ) : (
                  <p className="text-lg font-semibold text-[#1790d7]">{card.value}</p>
                )}
                {card.subtext && (
                  <p className="text-sm text-gray-500 mt-1">{card.subtext}</p>
                )}
              </div>
            );
          })}
        </motion.section>

        {/* Map */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/80 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#1790d7]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#1790d7]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{data.map.heading}</h2>
              {data.map.address && (
                <p className="text-sm text-gray-500">{data.map.address}</p>
              )}
            </div>
          </div>
          <div className="aspect-[21/9] min-h-[240px] bg-gray-200">
            {data.map.embed_url ? (
              <iframe
                src={data.map.embed_url}
                title="Map"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-sm">Map placeholder — add embed URL in CMS</span>
              </div>
            )}
          </div>
        </motion.section>

        {/* Two columns: Form | Support + Social */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/80 p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#1790d7]/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#1790d7]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{data.form_title}</h2>
              </div>
              {submitted ? (
                <div className="py-12 text-center">
                  <p className="text-emerald-600 font-semibold text-lg">Message sent successfully! We&apos;ll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="What's this about?"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message <span className="text-red-500">*</span></label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us more..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] text-sm resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-60 shadow-md"
                  >
                    <Send className="w-5 h-5" />
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Right: Support + Social */}
          <div className="space-y-6">
            {/* Need Immediate Help? */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/80 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#1790d7]/10 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-[#1790d7]" />
                </div>
                <h3 className="font-bold text-gray-900">{data.support.title}</h3>
              </div>
              {data.support.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{data.support.description}</p>
              )}
              <div className="space-y-3">
                {data.support.phone_value && (
                  <a
                    href={`tel:${data.support.phone_value}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-[#1790d7] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500">{data.support.phone_label}</p>
                      <p className="font-semibold text-[#1790d7] truncate">{data.support.phone_value}</p>
                    </div>
                  </a>
                )}
                {data.support.email_value && (
                  <a
                    href={`mailto:${data.support.email_value}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-[#1790d7] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500">{data.support.email_label}</p>
                      <p className="font-semibold text-[#1790d7] truncate">{data.support.email_value}</p>
                    </div>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Follow Us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/80 p-6"
            >
              <h3 className="font-bold text-gray-900 mb-1">{data.social.title}</h3>
              {data.social.subtext && (
                <p className="text-sm text-gray-500 mb-4">{data.social.subtext}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {data.social.links
                  .filter((l) => l.url)
                  .map((link, i) => {
                    const SocialIcon = SOCIAL_ICONS[link.platform] || Mail;
                    return (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#1790d7] hover:text-[#1790d7] hover:bg-[#1790d7]/5 transition-colors"
                        aria-label={link.platform}
                      >
                        <SocialIcon className="w-5 h-5" />
                      </a>
                    );
                  })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
