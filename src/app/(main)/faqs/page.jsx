"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { cmsApi } from "@/lib/api";
import { useSeoH1 } from "@/hooks/useSeoH1";
import { sanitizeRichTextHtml } from "@/lib/sanitizeRichText";

export default function FAQsPage() {
  const faqsH1 = useSeoH1("cms", { title: "Frequently Asked Questions", fallback: "Frequently Asked Questions" });
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const defaultFaqs = [
    { id: "d1", category: "General", question: "What is Tijaar?", answer: "Tijaar is a multi-seller marketplace where you can buy and sell products. We operate in Pakistan and Pakistan and connect buyers with verified sellers." },
    { id: "d2", category: "General", question: "How do I create an account?", answer: "Click Sign Up and enter your email. Verify your account and you can start shopping or apply to become a seller." },
    { id: "d3", category: "Buying", question: "How do I place an order?", answer: "Add items to your cart, go to checkout, enter your shipping and payment details, and confirm. You'll receive an order confirmation by email." },
    { id: "d4", category: "Buying", question: "What payment methods are accepted?", answer: "We support card payments, wallet, and other methods depending on your region. Available options are shown at checkout." },
    { id: "d5", category: "Buying", question: "How can I track my order?", answer: "Go to My Account → Orders and open your order to see status and tracking information when provided by the seller." },
    { id: "d6", category: "Selling", question: "How do I become a seller?", answer: "Go to Sellers and click Become a Seller (or Create Store). Complete registration and verification to start listing products." },
    { id: "d7", category: "Selling", question: "When do I get paid?", answer: "Payouts are processed according to your account settings. Check the Payouts section in your seller dashboard for schedule and history." },
    { id: "d8", category: "Returns", question: "What is your return policy?", answer: "Each seller sets their own return policy. Check the product page and seller profile. We also have a general Returns & Refunds page with more details." },
    { id: "d9", category: "Support", question: "How do I contact support?", answer: "Use the Contact Us page for general inquiries. For order issues, message the seller first from your order page; you can open a dispute if needed." },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await cmsApi.faqs();
        const list = res.faqs || [];
        setFaqs(list.length > 0 ? list : defaultFaqs);
      } catch {
        setFaqs(defaultFaqs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const byCategory = faqs.reduce((acc, f) => {
    const cat = f.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

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
            <span className="text-gray-900 font-medium">FAQs</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-16 lg:py-20">
        <div className="w-full px-4 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-center">
            {faqsH1}
          </h1>
          <p className="text-white/90 text-lg text-center max-w-2xl mx-auto">
            Find answers to common questions about Tijaar
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#1790d7] animate-spin" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <p className="text-gray-500">No FAQs available yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(byCategory).map(([category, items]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
              >
                <h2 className="px-6 py-4 bg-gray-50 font-semibold text-gray-900 border-b border-gray-100">
                  {category}
                </h2>
                <div className="divide-y divide-gray-100">
                  {items.map((faq) => (
                    <div key={faq.id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition"
                      >
                        <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                            openId === faq.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {openId === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                              {typeof faq.answer === "string" && faq.answer.startsWith("<") ? (
                                <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(faq.answer) }} />
                              ) : (
                                <p>{faq.answer}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
