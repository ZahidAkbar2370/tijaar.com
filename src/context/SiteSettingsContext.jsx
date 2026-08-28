"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { siteApi } from "@/lib/api";
import { SEO_H1_DEFAULTS } from "@/lib/seoHeadings";
import { TYPOGRAPHY_DEFAULTS, mergeTypography } from "@/lib/typography";

const defaultLogo = "/images/tijaar-logo.png";

const defaultPaymentMethods = [
  { value: "cod", label: "Cash on Delivery (COD)", desc: "Pay when you receive" },
  { value: "stripe", label: "Card (Stripe)", desc: "Credit/Debit card" },
  { value: "paypal", label: "PayPal", desc: "Pay with PayPal" },
  { value: "jazzcash", label: "JazzCash", desc: "Pakistan mobile wallet" },
  { value: "easypaisa", label: "Easypaisa", desc: "Pakistan mobile wallet" },
];

const defaultTopbar = {
  stats: ["Cash on Delivery Available", "Trusted Sellers"],
  contactPhone: "",
  socialLinks: { facebook: "#", twitter: "#", instagram: "#", music: "#" },
};

const defaults = {
  site_name: "Tijaar",
  site_logo_url: defaultLogo,
  site_logo_alt: "Tijaar logo",
  favicon_url: null,
  favicon_alt: "Tijaar favicon",
  login_logo_url: defaultLogo,
  login_logo_alt: "Tijaar login logo",
  meta_title: "Tijaar - Multi-Vendor Marketplace",
  meta_description: "Buy and sell anything, anywhere. Pakistan & Pakistan marketplace.",
  meta_keywords: "",
  seo_h1: SEO_H1_DEFAULTS,
  typography: TYPOGRAPHY_DEFAULTS,
  og_image_url: null,
  topbar_stats: defaultTopbar.stats,
  topbar_phone: defaultTopbar.contactPhone,
  topbar_social_links: defaultTopbar.socialLinks,
  payment_methods: defaultPaymentMethods,
  deposit_methods: [
    { value: "stripe", label: "Card (Stripe)" },
    { value: "jazzcash", label: "JazzCash" },
    { value: "easypaisa", label: "Easypaisa" },
  ],
  jazzcash_checkout_mode: "mwallet_v2",
  jazzcash_requires_mobile: true,
  jazzcash_requires_cnic: true,
  recaptcha_enabled: false,
  recaptcha_site_key: "",
  recaptcha_on_login: false,
  recaptcha_on_register: false,
  email_verification_required: true,
  private_seller_must_verify_email: false,
  private_seller_must_verify_phone: false,
  private_seller_must_verify_whatsapp: false,
};

const SiteSettingsContext = createContext(defaults);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    siteApi
      .getSettings()
      .then((res) => {
        if (res && typeof res === "object") {
          setSettings({
            site_name: res.site_name ?? defaults.site_name,
            site_tagline: res.site_tagline ?? "",
            site_logo_url: res.site_logo_url || defaultLogo,
            site_logo_alt: res.site_logo_alt || defaults.site_logo_alt,
            favicon_url: res.favicon_url || null,
            favicon_alt: res.favicon_alt || defaults.favicon_alt,
            login_logo_url: res.login_logo_url || res.site_logo_url || defaultLogo,
            login_logo_alt: res.login_logo_alt || res.site_logo_alt || defaults.login_logo_alt,
            email_logo_url: res.email_logo_url || null,
            email_banner_url: res.email_banner_url || null,
            og_image_url: res.og_image_url || null,
            meta_title: res.meta_title ?? defaults.meta_title,
            meta_description: res.meta_description ?? defaults.meta_description,
            meta_keywords: res.meta_keywords ?? "",
            seo_h1: res.seo_h1 && typeof res.seo_h1 === "object"
              ? { ...SEO_H1_DEFAULTS, ...res.seo_h1 }
              : defaults.seo_h1,
            typography: mergeTypography(res.typography),
            topbar_stats: Array.isArray(res.topbar_stats) && res.topbar_stats.length > 0 ? res.topbar_stats : defaults.topbar_stats,
            topbar_phone: res.topbar_phone ?? defaults.topbar_phone,
            topbar_social_links: res.topbar_social_links && typeof res.topbar_social_links === "object" ? res.topbar_social_links : defaults.topbar_social_links,
            contact_phone: res.contact_phone ?? "",
            contact_email: res.contact_email ?? "",
            contact_address: res.contact_address ?? "",
            footer_tagline: res.footer_tagline ?? "",
            payment_methods: Array.isArray(res.payment_methods) && res.payment_methods.length > 0 ? res.payment_methods : defaults.payment_methods,
            deposit_methods: Array.isArray(res.deposit_methods) ? res.deposit_methods : defaults.deposit_methods,
            jazzcash_checkout_mode: res.jazzcash_checkout_mode ?? defaults.jazzcash_checkout_mode,
            jazzcash_requires_mobile: res.jazzcash_requires_mobile !== undefined
              ? !!res.jazzcash_requires_mobile
              : defaults.jazzcash_requires_mobile,
            jazzcash_requires_cnic: res.jazzcash_requires_cnic !== undefined
              ? !!res.jazzcash_requires_cnic
              : defaults.jazzcash_requires_cnic,
            recaptcha_enabled: !!res.recaptcha_enabled,
            recaptcha_site_key: res.recaptcha_site_key || "",
            recaptcha_on_login: !!res.recaptcha_on_login,
            recaptcha_on_register: !!res.recaptcha_on_register,
            email_verification_required: res.email_verification_required !== undefined
              ? !!res.email_verification_required
              : defaults.email_verification_required,
            private_seller_must_verify_email: !!res.private_seller_must_verify_email,
            private_seller_must_verify_phone: !!res.private_seller_must_verify_phone,
            private_seller_must_verify_whatsapp: !!res.private_seller_must_verify_whatsapp,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  return context ?? defaults;
}
