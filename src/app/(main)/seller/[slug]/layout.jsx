import { buildPageMetadata, fetchApi, fetchSiteSettings, stripHtml } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [settings, data] = await Promise.all([
    fetchSiteSettings(),
    fetchApi(`/stores/${slug}`, 60),
  ]);
  const vendor = data?.vendor || data?.store;
  const siteName = settings?.site_name || "Tijaar";
  if (!vendor) {
    return buildPageMetadata({
      title: "Store Not Found",
      path: `/seller/${slug}`,
      siteSettings: settings,
    });
  }

  const businessName = vendor.storeName || vendor.store_name || vendor.name || "Seller";
  const profileTitle =
    vendor.meta_title ||
    stripHtml(vendor.description || "").slice(0, 120) ||
    `Shop from ${businessName} on ${siteName}`;
  const profileImage =
    vendor.logo || vendor.logo_url || settings?.favicon_url || settings?.site_logo_url || null;

  return buildPageMetadata({
    title: businessName,
    description: profileTitle,
    image: profileImage,
    path: `/seller/${slug}`,
    siteSettings: settings,
    authors: [{ name: siteName }],
  });
}

export default function SellerStoreLayout({ children }) {
  return children;
}
