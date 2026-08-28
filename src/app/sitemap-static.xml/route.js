import { buildUrlSetXml, fetchSitemapJson, resolveSitemapXml, xmlResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchSitemapJson("/sitemap/static");
  if (!data?.success) {
    return new Response("Not Found", { status: 404 });
  }
  const xml = resolveSitemapXml(data, (payload) => buildUrlSetXml(payload?.urls || []));
  return xmlResponse(xml);
}
