"use client";

import { Truck } from "lucide-react";
import SectionBasedPage from "@/components/cms/SectionBasedPage";

const DEFAULT = {
  hero: {
    title: "Shipping Information",
    subtitle: "How delivery works when you shop on Tijaar.",
    last_updated: "",
  },
  sections: [
    { title: "1. Who Ships My Order?", content: "<p>Tijaar is a marketplace. Sellers ship orders themselves. Shipping cost, speed, and coverage are set by each seller and shown on the product page and at checkout.</p>" },
    { title: "2. Delivery Times", content: "<p>Delivery times vary by seller and location—typically from a few days to 1–2 weeks. Some sellers offer express shipping for an extra fee.</p>" },
    { title: "3. Tracking", content: "<p>After your order is shipped, the seller may add a tracking number. View status in <strong>My Account → Orders</strong>. For delivery issues, contact the seller first; our support team can help if needed.</p>" },
    { title: "4. More Help", content: "<p>For more help, see our <a href=\"/help\">Help Center</a> or <a href=\"/contact\">Contact Us</a>.</p>" },
  ],
  footer_contact_text: "Questions about shipping? Contact us.",
  footer_copyright: "© 2024 Tijaar. All rights reserved.",
};

export default function ShippingContent() {
  return (
    <SectionBasedPage
      slug="shipping"
      defaultData={DEFAULT}
      Icon={Truck}
      badgeColor="bg-teal-50 border-teal-100 text-teal-800"
    />
  );
}
