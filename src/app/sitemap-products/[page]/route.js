import { buildUrlSetXml, fetchSitemapJson, resolveSitemapXml, xmlResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { page } = await params;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const data = await fetchSitemapJson(`/sitemap/products/${pageNum}`);

  if (!data?.success) {
    return new Response("Not Found", { status: 404 });
  }

  const xml = resolveSitemapXml(data, (payload) => buildUrlSetXml(payload?.urls || []));
  return xmlResponse(xml);
}
