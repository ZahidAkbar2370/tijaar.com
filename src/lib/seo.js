import { SEO_DEFAULTS } from "@/lib/seoDefaults";
import { resolveMediaUrl } from "@/lib/media";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tijaar.com").replace(/\/$/, "");
}

export function getBackendBaseUrl() {
  return API_BASE.replace(/\/api\/v1\/?$/, "");
}

export function resolveAbsoluteUrl(pathOrUrl, baseUrl = getSiteUrl()) {
  if (!pathOrUrl) return null;
  const value = String(pathOrUrl).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

function defaultOgImageUrl(siteUrl = getSiteUrl()) {
  return resolveAbsoluteUrl(SEO_DEFAULTS.ogImagePath, siteUrl);
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
  imageAlt = null,
  path,
  noIndex = false,
  siteSettings = null,
  exactTitle = false,
  authors = null,
  skipSiteKeywords = false,
  openGraphType = "website",
}) {
  const siteName = siteSettings?.site_name || "Tijaar";
  const defaultTitle = siteSettings?.meta_title?.trim() || SEO_DEFAULTS.title;
  const defaultDesc = siteSettings?.meta_description?.trim() || SEO_DEFAULTS.description;
  const keywordsStr = skipSiteKeywords
    ? String(keywords ?? "").trim()
    : String(keywords ?? siteSettings?.meta_keywords ?? SEO_DEFAULTS.keywords).trim();
  const defaultAuthor = siteSettings?.meta_author?.trim() || SEO_DEFAULTS.author;

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
  const siteUrl = getSiteUrl();
  const ogImageRaw =
    image ||
    siteSettings?.og_image_url ||
    siteSettings?.site_logo_url ||
    SEO_DEFAULTS.ogImagePath;
  const ogImage = resolveAbsoluteUrl(ogImageRaw, siteUrl) || defaultOgImageUrl(siteUrl);
  const ogImageAlt =
    imageAlt?.trim() ||
    siteSettings?.og_image_alt?.trim() ||
    siteSettings?.site_logo_alt?.trim() ||
    siteName;
  const favicon = siteSettings?.favicon_url || defaultFaviconUrl();
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
      type: openGraphType,
    },
    twitter: {
      card: "summary_large_image",
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
  metadata.authors = authors?.length
    ? authors
    : [{ name: defaultAuthor, url: siteUrl }];
  metadata.openGraph.images = [{ url: ogImage, alt: ogImageAlt }];
  metadata.twitter.images = [ogImage];

  return metadata;
}

/** Open Graph / social preview for a product detail page. */
export function buildProductMetadata(product, slug, siteSettings) {
  if (!product) {
    return buildPageMetadata({
      title: "Product Not Found",
      description: "This product could not be found on Tijaar.",
      path: `/product/${slug}`,
      siteSettings,
    });
  }

  const coverImage = resolveMediaUrl(product.thumbnail || product.image || product.images?.[0]);
  const description = stripHtml(product.description || product.short_description || "").trim();
  const shareDescription = description.slice(0, 160) || `Shop ${product.name} on Tijaar.`;

  return buildPageMetadata({
    title: product.name,
    description: shareDescription,
    keywords: product.meta_keywords?.trim() || "",
    exactTitle: true,
    image: coverImage || null,
    imageAlt: product.image_alt?.trim() || product.name,
    path: `/product/${slug}`,
    siteSettings,
    authors: [{ name: SEO_DEFAULTS.author, url: getSiteUrl() }],
    skipSiteKeywords: true,
    openGraphType: "website",
  });
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
      : settings?.meta_title?.trim() || page?.banner_title || page?.title || fallbackTitle,
    description: page?.meta_description?.trim()
      ? page.meta_description
      : settings?.meta_description?.trim() || page?.banner_subtitle || fallbackDescription,
    keywords: page?.meta_keywords?.trim() ? page.meta_keywords : settings?.meta_keywords,
    path,
    siteSettings: settings,
    exactTitle: hasMetaTitle || Boolean(settings?.meta_title?.trim()),
  });
}

export async function generateRootMetadata() {
  const settings = await fetchSiteSettings();
  return buildPageMetadata({
    title: settings?.meta_title?.trim() || SEO_DEFAULTS.title,
    description: settings?.meta_description?.trim() || SEO_DEFAULTS.description,
    keywords: settings?.meta_keywords?.trim() || SEO_DEFAULTS.keywords,
    path: "/",
    siteSettings: settings,
    exactTitle: true,
  });
}
