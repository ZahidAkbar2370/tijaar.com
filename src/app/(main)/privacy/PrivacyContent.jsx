"use client";

import { FileText } from "lucide-react";
import SectionBasedPage from "@/components/cms/SectionBasedPage";

const DEFAULT = {
  hero: {
    title: "Privacy Policy",
    subtitle: "Please read this privacy policy carefully to understand how we collect, use, and protect your personal data.",
    last_updated: "October 10, 2023",
  },
  sections: [
    { title: "1. Introduction", content: "<p>At Tijaar, we are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>" },
    { title: "2. Personal Information We Collect", content: "<p>We may collect your name, email address, phone number, billing and shipping address, and payment information (processed securely by our payment providers).</p>" },
    { title: "3. How We Use It", content: "<p>We use your information to process orders, improve customer service, send periodic emails where you have opted in, and personalize your experience.</p>" },
  ],
  footer_contact_text: "Questions about the Privacy Policy? If you have any questions about this Privacy Policy, please contact us.",
  footer_copyright: "© 2024 Tijaar. All rights reserved.",
};

export default function PrivacyContent() {
  return (
    <SectionBasedPage
      slug="privacy"
      defaultData={DEFAULT}
      Icon={FileText}
      badgeColor="bg-emerald-50 border-emerald-100 text-teal-800"
    />
  );
}
