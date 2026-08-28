"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ChevronRight, Loader2 } from "lucide-react";
import { cmsApi } from "@/lib/api";
import { sanitizeRichTextHtml } from "@/lib/sanitizeRichText";

const FALLBACK_PAGES = {
  terms: {
    title: "Terms of Service",
    content: `
      <h2>Welcome to Tijaar</h2>
      <p>By using Tijaar ("the platform"), you agree to these Terms of Service. Please read them carefully. We serve buyers and sellers in Pakistan and Pakistan.</p>

      <h2>Using the Platform</h2>
      <p>You may use Tijaar to browse, buy, or sell products in line with our policies. You must be at least 18 years old (or the age of majority in your country) and provide accurate information when registering. You are responsible for keeping your account secure.</p>

      <h2>Buyers</h2>
      <p>When you buy on Tijaar, you enter into a contract with the seller. Payment and delivery terms are between you and the seller, subject to our payment and dispute rules. We are not the seller of the goods; we provide the marketplace and related services.</p>

      <h2>Sellers</h2>
      <p>Sellers must comply with our seller policies, listing rules, and applicable law. You are responsible for the accuracy of listings, shipping, and customer service. We may suspend or remove accounts that violate our policies or the law.</p>

      <h2>Fees and Payments</h2>
      <p>We may charge fees for selling or premium features. Any applicable fees will be shown before you commit. Refunds for our fees are subject to our refund policy.</p>

      <h2>Prohibited Conduct</h2>
      <p>You may not use Tijaar for illegal activity, fraud, counterfeit goods, or to harm others. We reserve the right to remove content and suspend or terminate accounts that violate these terms.</p>

      <h2>Disputes</h2>
      <p>We provide dispute resolution tools for order issues. Our decisions in mediation are intended to be fair but are not a substitute for legal recourse where applicable.</p>

      <h2>Changes</h2>
      <p>We may update these terms from time to time. Continued use after changes means you accept the new terms. For major changes, we will notify you where required by law.</p>

      <p>For questions, see our <a href="/contact">Contact</a> page or <a href="/help">Help Center</a>. Also review our <a href="/privacy">Privacy Policy</a>.</p>
    `,
  },
  privacy: {
    title: "Privacy Policy",
    content: `
      <h2>Your Privacy Matters</h2>
      <p>Tijaar ("we") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information when you use our marketplace in Pakistan and Pakistan.</p>

      <h2>Information We Collect</h2>
      <p>We collect information you provide (e.g. name, email, address, phone when you register, buy, or sell), information from your use of the site (e.g. device, IP, browsing data), and information from sellers about orders and payouts. Payment details are processed by our payment providers in line with their privacy policies.</p>

      <h2>How We Use Your Information</h2>
      <p>We use your data to run the platform (e.g. processing orders, payouts, and support), to improve our services and security, to send important notices (e.g. order updates), and with your consent for marketing. We may use analytics to understand how the site is used.</p>

      <h2>Sharing Your Information</h2>
      <p>We share information with sellers/buyers as needed to complete orders (e.g. delivery address with seller). We may share with service providers (hosting, payments, analytics) who act on our instructions. We do not sell your personal data to third parties for their marketing. We may disclose data when required by law or to protect rights and safety.</p>

      <h2>Security</h2>
      <p>We use reasonable technical and organizational measures to protect your data. No system is 100% secure; we encourage you to use a strong password and keep your account secure.</p>

      <h2>Your Rights</h2>
      <p>Depending on your location, you may have rights to access, correct, delete, or restrict use of your data, or to object to certain processing. You can update your profile in your account and contact us for other requests. You may also have the right to lodge a complaint with a supervisory authority.</p>

      <h2>Cookies</h2>
      <p>We use cookies and similar technologies as described in our <a href="/cookie-policy">Cookie Policy</a>.</p>

      <h2>Updates</h2>
      <p>We may update this Privacy Policy. The latest version will be on this page. We will notify you of significant changes where required.</p>

      <p>For questions, <a href="/contact">contact us</a> or visit our <a href="/help">Help Center</a>. See also our <a href="/terms">Terms of Service</a> and <a href="/cookie-policy">Cookie Policy</a>.</p>
    `,
  },
};

export default function CmsPageContent({ slug, title: fallbackTitle, showBreadcrumb = true }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await cmsApi.page(slug);
        setPage(res.page);
      } catch (e) {
        setError(e?.data?.message || "Page not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const fallback = FALLBACK_PAGES[slug];
  const effectivePage = page || (fallback ? { title: fallback.title, content: fallback.content } : null);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1790d7] animate-spin" />
      </div>
    );
  }
  if (!effectivePage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || "Page not found"}</p>
          <Link href="/" className="text-[#1790d7] hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {showBreadcrumb && (
        <div className="bg-white border-b border-gray-100">
          <div className="w-full px-4 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#1790d7] flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
              <span className="text-gray-900 font-medium">{effectivePage.title}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-16 lg:py-20">
        <div className="w-full px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
            {effectivePage.banner_title || effectivePage.title}
          </h1>
          {effectivePage.banner_subtitle ? (
            <p className="text-lg text-white/95 max-w-2xl mx-auto">
              {effectivePage.banner_subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 lg:px-8 py-16"
      >
        <div
          className="rich-text-content cms-content max-w-none text-gray-600 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 lg:p-12"
          dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(effectivePage.content) || "<p>No content available.</p>" }}
        />
      </motion.div>
    </div>
  );
}
