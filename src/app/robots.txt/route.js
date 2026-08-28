import { fetchSiteSettings, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const FALLBACK_ROBOTS = `User-agent: *
Allow: /
Disallow: /customer/
Disallow: /seller/
Disallow: /checkout
Disallow: /cart
Disallow: /login
Disallow: /register
Disallow: /auth/

Sitemap: ${getSiteUrl()}/sitemap.xml`;

export async function GET() {
  const settings = await fetchSiteSettings({ noStore: true });
  const body = settings?.robots_txt?.trim() || FALLBACK_ROBOTS;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
