"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { cmsApi } from "@/lib/api";
import { useSeoH1 } from "@/hooks/useSeoH1";
import { sanitizeRichTextHtml } from "@/lib/sanitizeRichText";

/**
 * Premium section-based CMS page (Cookie Policy, Help Center, Returns & Refunds, Shipping).
 * Fetches page by slug; uses sections array + hero + footer. Fallback to defaultData when API fails or sections empty.
 * @param {string} slug - CMS page slug (e.g. 'cookie-policy', 'help', 'returns-refunds', 'shipping')
 * @param {object} defaultData - { hero: { title, subtitle, last_updated }, sections: [{ title, content }], footer_contact_text, footer_copyright }
 * @param {React.Component} Icon - Lucide icon component for hero
 * @param {string} badgeColor - Tailwind classes for number badge, e.g. 'bg-amber-50 border-amber-100 text-amber-800' or 'bg-emerald-50 border-emerald-100 text-teal-800'
 */
export default function SectionBasedPage({ slug, defaultData, Icon, badgeColor = "bg-emerald-50 border-emerald-100 text-teal-800" }) {
  const [cmsPage, setCmsPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const data = useMemo(() => {
    const s = cmsPage?.page?.sections || {};
    const hero = {
      title: cmsPage?.page?.banner_title || cmsPage?.page?.title || defaultData.hero.title,
      subtitle: cmsPage?.page?.banner_subtitle || defaultData.hero.subtitle,
      last_updated: s.last_updated ?? defaultData.hero.last_updated,
    };
    const sections = Array.isArray(s.sections) && s.sections.length > 0 ? s.sections : defaultData.sections;
    const footer_contact_text = s.footer_contact_text ?? defaultData.footer_contact_text;
    const footer_copyright = s.footer_copyright ?? defaultData.footer_copyright;
    return { hero, sections, footer_contact_text, footer_copyright };
  }, [cmsPage, defaultData]);

  const pageTitle = cmsPage?.page?.banner_title || cmsPage?.page?.title || defaultData.hero.title;
  const h1 = useSeoH1("policy", { title: pageTitle, fallback: pageTitle });

  useEffect(() => {
    let cancelled = false;
    cmsApi
      .page(slug)
      .then((res) => { if (!cancelled) setCmsPage(res); })
      .catch(() => { if (!cancelled) setCmsPage(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

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
      <div className="bg-[#1790d7]/10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 max-w-5xl xl:max-w-[85%] min-w-0">
          <nav className="flex items-center justify-start gap-2 text-sm text-[#0d6fa8] font-medium">
            <Link href="/" className="flex items-center gap-1 hover:text-[#1790d7] transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">{data.hero.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1790d7] to-[#4db3e8] py-14 lg:py-20">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl xl:max-w-[85%] min-w-0">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center mb-5 shadow-lg">
            {Icon && <Icon className="w-8 h-8 text-white" />}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold text-white tracking-tight"
          >
            {h1}
          </motion.h1>
          {data.hero.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mt-3 text-white/95 text-base lg:text-lg max-w-2xl mx-auto"
            >
              {data.hero.subtitle}
            </motion.p>
          )}
          {data.hero.last_updated && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-white/80 text-sm"
            >
              Last updated: {data.hero.last_updated}
            </motion.p>
          )}
        </div>
      </section>

      {/* Content: premium cards */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-5xl xl:max-w-[85%] min-w-0">
        <div className="space-y-6">
          {data.sections.map((sec, i) => {
            const titleStr = sec.title || "";
            const numMatch = titleStr.match(/^(\d+)\.\s*(.*)$/);
            const num = numMatch ? numMatch[1] : String(i + 1);
            const headingOnly = numMatch ? numMatch[2].trim() : titleStr;
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-6 lg:p-8"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center text-base font-bold ${badgeColor}`}>
                    {num}
                  </span>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 pt-1.5">
                    {headingOnly || titleStr}
                  </h2>
                </div>
                <div
                  className="rich-text-content section-body text-gray-600 leading-relaxed prose prose-p:mb-3 prose-p:last:mb-0 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-strong:text-gray-900 max-w-none pl-0 lg:pl-[3.25rem]"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(sec.content) || "<p>No content.</p>" }}
                />
              </motion.article>
            );
          })}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 space-y-6"
        >
          {data.footer_contact_text && (
            <div className="bg-[#1790d7]/10 rounded-2xl border border-[#1790d7]/20 p-6 lg:p-8 text-center">
              <p className="text-gray-700 text-lg font-medium mb-4">Need more help?</p>
              <p className="text-gray-600 leading-relaxed mb-6">
                {data.footer_contact_text}
                {" "}
                <Link href="/contact" className="text-[#1790d7] font-medium hover:underline">
                  contact us
                </Link>
                .
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#1790d7] text-white font-semibold rounded-xl hover:bg-[#0d6fa8] transition-colors shadow-sm"
              >
                Contact Support
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
