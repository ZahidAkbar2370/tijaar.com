const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tijaar.com").replace(/\/$/, "");
}

export function getBackendBaseUrl() {
  return API_BASE.replace(/\/api\/v1\/?$/, "");
}

function defaultFaviconUrl() {
  return `${getBackendBaseUrl()}/images/tijaar-logo.png`;
}

export async function fetchSiteSettings(options = {}) {
  const { noStore = false } = options;
  try {
    const res = await fetch(`${API_BASE}/site-settings`, noStore ? { cache: "no-store" } : { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.success === false ? null : data;
  } catch {
    return null;
  }
}

export async function fetchApi(path, revalidate = 300) {
  try {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const res = await fetch(`${API_BASE}${normalized}`, { next: { revalidate } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Fresh CMS page data for SEO (no cache — admin edits show immediately). */
export async function fetchCmsPage(slug) {
  try {
    const res = await fetch(`${API_BASE}/pages/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.page ?? null;
  } catch {
    return null;
  }
}

export function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Build Next.js Metadata with favicon, Open Graph, Twitter, and canonical URL.
 */
export function buildPageMetadata({
  title,
  description,
  keywords,
  image,
  path,
  noIndex = false,
  siteSettings = null,
  exactTitle = false,
  authors = null,
}) {
  const siteName = siteSettings?.site_name || "Tijaar";
  const defaultTitle = siteSettings?.meta_title || `${siteName} - Multi-Vendor Marketplace`;
  const defaultDesc =
    siteSettings?.meta_description || "Buy and sell anything, anywhere. Pakistan marketplace.";
  const keywordsStr = keywords ?? siteSettings?.meta_keywords ?? "";

  let resolvedTitle = defaultTitle;
  if (title) {
    if (exactTitle) {
      resolvedTitle = title;
    } else if (title.includes(siteName)) {
      resolvedTitle = title;
    } else {
      resolvedTitle = `${title} | ${siteName}`;
    }
  }
  const resolvedDesc =
    description !== undefined && description !== null && String(description).trim() !== ""
      ? description
      : defaultDesc;
  const ogImage = image || siteSettings?.og_image_url || siteSettings?.site_logo_url || null;
  const favicon = siteSettings?.favicon_url || defaultFaviconUrl();
  const siteUrl = getSiteUrl();
  const canonical = path
    ? `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`
    : siteUrl;

  const metadata = {
    title: resolvedTitle,
    description: resolvedDesc,
    metadataBase: new URL(siteUrl),
    alternates: { canonical },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDesc,
      url: canonical,
      siteName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDesc,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    icons: {
      icon: [{ url: favicon }],
      shortcut: [{ url: favicon }],
      apple: [{ url: favicon }],
    },
  };

  if (keywordsStr) metadata.keywords = keywordsStr;
  if (authors?.length) metadata.authors = authors;
  if (ogImage) {
    metadata.openGraph.images = [{ url: ogImage, alt: title || siteName }];
    metadata.twitter.images = [ogImage];
  }

  return metadata;
}

export async function generateStaticPageMetadata({
  title,
  description,
  keywords,
  path,
  noIndex = false,
  image = null,
}) {
  const settings = await fetchSiteSettings();
  return buildPageMetadata({
    title,
    description,
    keywords,
    path,
    noIndex,
    image,
    siteSettings: settings,
  });
}

export async function generateCmsPageMetadata(slug, fallbackTitle, fallbackDescription) {
  const [settings, page] = await Promise.all([
    fetchSiteSettings(),
    fetchCmsPage(slug),
  ]);
  const path = slug === "home" ? "/" : `/${slug}`;
  const hasMetaTitle = Boolean(page?.meta_title?.trim());
  return buildPageMetadata({
    title: hasMetaTitle
      ? page.meta_title
      : page?.banner_title || page?.title || fallbackTitle,
    description: page?.meta_description?.trim()
      ? page.meta_description
      : page?.banner_subtitle || fallbackDescription,
    keywords: page?.meta_keywords?.trim() ? page.meta_keywords : undefined,
    path,
    siteSettings: settings,
    exactTitle: hasMetaTitle,
  });
}

export async function generateRootMetadata() {
  const settings = await fetchSiteSettings();
  return buildPageMetadata({
    title: settings?.meta_title,
    description: settings?.meta_description,
    keywords: settings?.meta_keywords,
    path: "/",
    siteSettings: settings,
  });
}
