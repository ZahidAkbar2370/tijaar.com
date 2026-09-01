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
  CheckCircle2,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Music2,
  ArrowRight,
} from "lucide-react";
import { cmsApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { useSeoH1 } from "@/hooks/useSeoH1";
import { isValidEmail } from "@/lib/validators";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { mergeContactPageData, isConfiguredUrl } from "@/lib/siteContact";

const STATIC = {
  hero: {
    title: "Get in Touch",
    subtitle:
      "Have a question or need help? We're here for you. Reach out and we'll get back to you as soon as possible.",
  },
};

const SOCIAL_ICONS = {
  facebook: { Icon: Facebook, hover: "hover:bg-[#1877F2] hover:border-[#1877F2]" },
  twitter: { Icon: Twitter, hover: "hover:bg-black hover:border-black" },
  instagram: { Icon: Instagram, hover: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:border-pink-500" },
  youtube: { Icon: Youtube, hover: "hover:bg-red-600 hover:border-red-600" },
  tiktok: { Icon: Music2, hover: "hover:bg-gray-900 hover:border-gray-900" },
};

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] text-sm transition-colors";

function buildDataFromCms(page, settings) {
  const s = page?.sections || {};
  const hero = {
    title: page?.banner_title || page?.title || STATIC.hero.title,
    subtitle: page?.banner_subtitle || STATIC.hero.subtitle,
  };
  const merged = mergeContactPageData(s, settings);
  return { hero, ...merged };
}

export default function ContactContent() {
  const settings = useSiteSettings();
  const [cmsPage, setCmsPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const { showSuccess, showError } = useSnackbar();

  const data = useMemo(() => {
    if (cmsPage?.page) return buildDataFromCms(cmsPage.page, settings);
    return buildDataFromCms(null, settings);
  }, [cmsPage, settings]);

  const h1 = useSeoH1("cms", { title: data.hero.title, fallback: data.hero.title });
  const configuredSocial = data.social.links.filter((l) => isConfiguredUrl(l.url));

  useEffect(() => {
    let cancelled = false;
    cmsApi
      .page("contact")
      .then((res) => {
        if (!cancelled) setCmsPage(res);
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

      <h1 className="sr-only">{h1}</h1>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 pb-16 lg:pb-24">
        {/* Form + Support sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-14 lg:mb-16">
          {/* Form */}
          <motion.section
            id="message"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 xl:col-span-8 scroll-mt-24"
          >
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
              <div className="px-6 lg:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center shadow-md">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#1790d7]">
                      Write to us
                    </span>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{data.form_title}</h2>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600">We&apos;ll get back to you as soon as possible.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Your name"
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                        placeholder="What's this about?"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        placeholder="Tell us more about your question or issue..."
                        className={`${inputClass} resize-none`}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white font-semibold rounded-xl hover:shadow-lg hover:opacity-95 transition-all disabled:opacity-60"
                    >
                      <Send className="w-5 h-5" />
                      {sending ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.section>

          {/* Support */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <motion.div
              id="support"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-24 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50/80 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                      Quick support
                    </span>
                    <h3 className="font-bold text-gray-900">{data.support.title}</h3>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {data.support.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{data.support.description}</p>
                )}
                <div className="space-y-3">
                  {data.support.phone_value && (
                    <a
                      href={`tel:${data.support.phone_value}`}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-white hover:border-[#1790d7]/30 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 transition-colors">
                        <Phone className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500">{data.support.phone_label}</p>
                        <p className="font-semibold text-gray-900 truncate">{data.support.phone_value}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1790d7] shrink-0 transition-colors" />
                    </a>
                  )}
                  {data.support.email_value && (
                    <a
                      href={`mailto:${data.support.email_value}`}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-white hover:border-[#1790d7]/30 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 group-hover:bg-[#1790d7] transition-colors">
                        <Mail className="w-5 h-5 text-[#1790d7] group-hover:text-white transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500">{data.support.email_label}</p>
                        <p className="font-semibold text-gray-900 truncate">{data.support.email_value}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1790d7] shrink-0 transition-colors" />
                    </a>
                  )}
                  {data.support.address_value && (
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/80">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500">
                          {data.support.address_label || "Address"}
                        </p>
                        <p className="font-semibold text-gray-900 leading-snug">{data.support.address_value}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </aside>
        </div>

        {/* Follow Tijaar — full width row */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 mb-14 lg:mb-16"
        >
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-8">
                <span className="inline-block px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-800 text-xs font-semibold mb-3">
                  Social
                </span>
                <h3 className="font-bold text-gray-900 text-lg lg:text-xl mb-2">{data.social.title}</h3>
                {data.social.subtext && (
                  <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{data.social.subtext}</p>
                )}
              </div>
              <div className="lg:col-span-4 lg:flex lg:justify-end">
                {configuredSocial.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {configuredSocial.map((link, i) => {
                      const social = SOCIAL_ICONS[link.platform] || { Icon: Mail, hover: "hover:bg-[#1790d7] hover:border-[#1790d7]" };
                      const SocialIcon = social.Icon;
                      return (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-11 h-11 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:text-white transition-all ${social.hover}`}
                          aria-label={link.platform}
                        >
                          <SocialIcon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Social links appear when configured in Admin settings.</p>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
