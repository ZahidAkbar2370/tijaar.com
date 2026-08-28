"use client";

import { Cookie } from "lucide-react";
import SectionBasedPage from "@/components/cms/SectionBasedPage";

const DEFAULT = {
  hero: {
    title: "Cookie Policy",
    subtitle: "How we use cookies on Tijaar to improve your experience and keep the site secure.",
    last_updated: "",
  },
  sections: [
    { title: "1. What Are Cookies?", content: "<p>Cookies are small text files stored on your device when you visit our website. They help us remember your preferences, keep you logged in, and improve how the site works.</p>" },
    { title: "2. How We Use Cookies", content: "<p>We use cookies for essential functions, preferences, analytics, and (with your consent) marketing. You can manage your preferences in your browser or in our settings.</p>" },
    { title: "3. Managing Cookies", content: "<p>You can control or delete cookies through your browser settings. Blocking all cookies may affect your ability to log in or use the cart. Essential cookies are required for the site to function.</p>" },
  ],
  footer_contact_text: "If you have questions about our use of cookies, please contact us.",
  footer_copyright: "© 2024 Tijaar. All rights reserved.",
};

export default function CookiePolicyContent() {
  return (
    <SectionBasedPage
      slug="cookie-policy"
      defaultData={DEFAULT}
      Icon={Cookie}
      badgeColor="bg-amber-50 border-amber-100 text-amber-800"
    />
  );
}
