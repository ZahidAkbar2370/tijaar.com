"use client";

import { HelpCircle } from "lucide-react";
import SectionBasedPage from "@/components/cms/SectionBasedPage";

const DEFAULT = {
  hero: {
    title: "Help Center",
    subtitle: "Find answers, guides, and support for buying and selling on Tijaar.",
    last_updated: "",
  },
  sections: [
    { title: "1. Getting Started", content: "<p>Create an account, browse products, and place orders. Sellers can register and start listing after verification.</p>" },
    { title: "2. Orders & Tracking", content: "<p>View your orders in <strong>My Account → Orders</strong>. Sellers may add tracking after shipping. For delivery issues, contact the seller first from your order page.</p>" },
    { title: "3. Returns & Refunds", content: "<p>Each seller sets their return policy. For damaged or wrong items, contact the seller or open a dispute. See our <a href=\"/returns-refunds\">Returns & Refunds</a> page for details.</p>" },
    { title: "4. Need More Help?", content: "<p>Visit our <a href=\"/faqs\">FAQs</a>, <a href=\"/shipping\">Shipping Info</a>, or <a href=\"/contact\">Contact Us</a>.</p>" },
  ],
  footer_contact_text: "Need more help? Contact our support team.",
  footer_copyright: "© 2024 Tijaar. All rights reserved.",
};

export default function HelpContent() {
  return (
    <SectionBasedPage
      slug="help"
      defaultData={DEFAULT}
      Icon={HelpCircle}
      badgeColor="bg-sky-50 border-sky-100 text-sky-800"
    />
  );
}
