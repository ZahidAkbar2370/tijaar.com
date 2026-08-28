import { buildSitemapIndexXml, fetchSitemapJson, resolveSitemapXml, xmlResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchSitemapJson("/sitemap");
  if (!data?.success) {
    return new Response("Not Found", { status: 404 });
  }
  const xml = resolveSitemapXml(data, (payload) => buildSitemapIndexXml(payload?.entries || []));
  return xmlResponse(xml);
}
