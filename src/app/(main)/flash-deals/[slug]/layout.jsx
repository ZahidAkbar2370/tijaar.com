import { buildPageMetadata, fetchApi, fetchSiteSettings } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [settings, data] = await Promise.all([
    fetchSiteSettings(),
    fetchApi(`/flash-deals/${slug}`, 60),
  ]);
  const deal = data?.flash_deal;
  if (!deal) {
    return buildPageMetadata({
      title: "Flash Deal Not Found",
      path: `/flash-deals/${slug}`,
      siteSettings: settings,
    });
  }
  return buildPageMetadata({
    title: deal.name,
    description: `Limited-time flash deal: ${deal.name} on Tijaar.`,
    image: deal.image_url,
    path: `/flash-deals/${slug}`,
    siteSettings: settings,
  });
}

export default function FlashDealDetailLayout({ children }) {
  return children;
}
