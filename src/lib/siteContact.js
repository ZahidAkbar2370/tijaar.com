/** True when a social/contact URL is configured in admin (not empty or "#"). */
export function isConfiguredUrl(url) {
  if (!url || typeof url !== "string") return false;
  const value = url.trim();
  return value.length > 0 && value !== "#";
}

export const FOOTER_DEFAULTS = {
  about:
    "Tijaar is the #1 multi-seller marketplace connecting buyers and sellers. Shop with confidence from verified sellers across Pakistan.",
  phone: "+92 300 1234567",
  email: "support@tijaar.com",
  address: "Pakistan",
  social: {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    youtube: "#",
    music: "#",
  },
};

/** Social platforms from Admin → Top Bar settings. */
export const SOCIAL_PLATFORM_KEYS = ["facebook", "twitter", "instagram", "youtube", "music"];

export function getSocialLinksMap(settings) {
  const raw =
    settings?.topbar_social_links && typeof settings.topbar_social_links === "object"
      ? settings.topbar_social_links
      : {};
  return SOCIAL_PLATFORM_KEYS.reduce((acc, key) => {
    const url = raw[key];
    if (isConfiguredUrl(url)) acc[key] = url.trim();
    return acc;
  }, {});
}

/** Footer social icons: admin URLs first, placeholder "#" when unset (legacy display). */
export function getFooterSocialLinksMap(settings) {
  const raw =
    settings?.topbar_social_links && typeof settings.topbar_social_links === "object"
      ? settings.topbar_social_links
      : {};
  return SOCIAL_PLATFORM_KEYS.reduce((acc, key) => {
    const url = (raw[key] || FOOTER_DEFAULTS.social[key] || "").trim();
    if (url) acc[key] = url;
    return acc;
  }, {});
}

export function getFooterAbout(settings) {
  return (
    settings?.footer_tagline?.trim() ||
    settings?.site_tagline?.trim() ||
    FOOTER_DEFAULTS.about
  );
}

export function getContactFields(settings) {
  return {
    phone: settings?.contact_phone?.trim() || "",
    email: settings?.contact_email?.trim() || "",
    address: settings?.contact_address?.trim() || "",
  };
}

/** Footer contact: admin Contact & Footer values, then topbar phone, then defaults. */
export function getFooterContactFields(settings) {
  const admin = getContactFields(settings);
  return {
    phone: admin.phone || settings?.topbar_phone?.trim() || FOOTER_DEFAULTS.phone,
    email: admin.email || FOOTER_DEFAULTS.email,
    address: admin.address || FOOTER_DEFAULTS.address,
  };
}

/** Array for contact page social section: [{ platform, url }]. */
export function getSocialLinkEntries(settings) {
  return Object.entries(getSocialLinksMap(settings)).map(([platform, url]) => ({
    platform: platform === "music" ? "tiktok" : platform,
    url,
  }));
}

/** Contact cards for the contact page from Admin → Contact & Footer. */
export function buildContactCardsFromSettings(settings) {
  const { phone, email, address } = getContactFields(settings);
  return [
    phone
      ? { type: "phone", label: "Phone", value: phone, subtext: "Call us anytime" }
      : null,
    email
      ? { type: "email", label: "Email", value: email, subtext: "Send us an email" }
      : null,
    address
      ? { type: "address", label: "Address", value: address, subtext: "Visit our office" }
      : null,
  ].filter(Boolean);
}

/** Defaults for contact page driven by admin settings (CMS can override). */
export function buildContactDefaultsFromSettings(settings) {
  const { phone, email, address } = getFooterContactFields(settings);
  const contact_cards = [
    phone
      ? { type: "phone", label: "Phone", value: phone, subtext: "Call us anytime" }
      : null,
    email
      ? { type: "email", label: "Email", value: email, subtext: "Send us an email" }
      : null,
    address
      ? { type: "address", label: "Address", value: address, subtext: "Visit our office" }
      : null,
  ].filter(Boolean);

  return {
    contact_cards,
    map: {
      heading: "Our Location",
      address,
      embed_url: "",
    },
    support: {
      title: "Need Immediate Help with an Order?",
      description:
        "Our support team is here to assist you with any questions or concerns. Reach out via phone or email and we'll respond as soon as possible.",
      phone_label: "Call Us",
      phone_value: phone,
      email_label: "Email Us",
      email_value: email,
      address_label: "Address",
      address_value: address,
    },
    social: {
      title: "Follow Us",
      subtext: "Stay connected with us on social media",
      links: Object.entries(getFooterSocialLinksMap(settings))
        .filter(([, url]) => isConfiguredUrl(url))
        .map(([platform, url]) => ({
          platform: platform === "music" ? "tiktok" : platform,
          url,
        })),
    },
  };
}

function hasCmsContactCards(cards) {
  return Array.isArray(cards) && cards.some((c) => c?.value?.trim());
}

function hasCmsSocialLinks(links) {
  return Array.isArray(links) && links.some((l) => isConfiguredUrl(l?.url));
}

/** Merge CMS contact page sections with admin settings (CMS wins when populated). */
export function mergeContactPageData(cmsSections, settings) {
  const admin = buildContactDefaultsFromSettings(settings);
  const s = cmsSections || {};

  const contact_cards = hasCmsContactCards(s.contact_cards)
    ? s.contact_cards
    : admin.contact_cards;

  const map = {
    heading: s.map?.heading?.trim() || admin.map.heading,
    address: s.map?.address?.trim() || admin.map.address,
    embed_url: s.map?.embed_url?.trim() || admin.map.embed_url,
  };

  const support = {
    title: s.support?.title?.trim() || admin.support.title,
    description: s.support?.description?.trim() || admin.support.description,
    phone_label: s.support?.phone_label?.trim() || admin.support.phone_label,
    phone_value: s.support?.phone_value?.trim() || admin.support.phone_value,
    email_label: s.support?.email_label?.trim() || admin.support.email_label,
    email_value: s.support?.email_value?.trim() || admin.support.email_value,
    address_label: s.support?.address_label?.trim() || admin.support.address_label,
    address_value: s.support?.address_value?.trim() || s.map?.address?.trim() || admin.support.address_value,
  };

  const social = {
    title: s.social?.title?.trim() || admin.social.title,
    subtext: s.social?.subtext?.trim() || admin.social.subtext,
    links: hasCmsSocialLinks(s.social?.links) ? s.social.links : admin.social.links,
  };

  return { contact_cards, map, form_title: s.form_title?.trim() || "Send us a Message", support, social };
}
