"use client";

import { RotateCcw } from "lucide-react";
import SectionBasedPage from "@/components/cms/SectionBasedPage";

const DEFAULT = {
  hero: {
    title: "Returns & Refunds",
    subtitle: "Your satisfaction matters. Here is how returns and refunds work on Tijaar.",
    last_updated: "",
  },
  sections: [
    { title: "1. Your Satisfaction Matters", content: "<p>If you receive an item that is damaged or not as described, contact the seller through your order page. Most sellers will offer a replacement or refund.</p>" },
    { title: "2. Return Window", content: "<p>The return window is shown on the product or seller profile. Returns must usually be requested within this period. Keep your order confirmation and any photos of the issue.</p>" },
    { title: "3. How to Request a Return", content: "<p>Go to <strong>My Account → Orders</strong>, open the order, and click Request Return or Contact Seller. If the seller approves, follow their return instructions. Refunds are typically processed after the seller receives and confirms the return.</p>" },
    { title: "4. Disputes", content: "<p>If you cannot resolve an issue with the seller, you may open a dispute and our team will help mediate. See our <a href=\"/help\">Help Center</a> or <a href=\"/contact\">Contact Us</a>.</p>" },
  ],
  footer_contact_text: "Questions about returns or refunds? Contact us.",
  footer_copyright: "© 2024 Tijaar. All rights reserved.",
};

export default function ReturnsRefundsContent() {
  return (
    <SectionBasedPage
      slug="returns-refunds"
      defaultData={DEFAULT}
      Icon={RotateCcw}
      badgeColor="bg-emerald-50 border-emerald-100 text-teal-800"
    />
  );
}
