const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSitemapIndexXml(entries = []) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const entry of entries) {
    xml += "  <sitemap>\n";
    xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    xml += `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n`;
    xml += "  </sitemap>\n";
  }
  xml += "</sitemapindex>";
  return xml;
}

export function buildUrlSetXml(urls = []) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const url of urls) {
    xml += "  <url>\n";
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    xml += `    <lastmod>${escapeXml(url.lastmod)}</lastmod>\n`;
    if (url.changefreq) {
      xml += `    <changefreq>${escapeXml(url.changefreq)}</changefreq>\n`;
    }
    if (url.priority !== undefined && url.priority !== null && url.priority !== "") {
      xml += `    <priority>${escapeXml(url.priority)}</priority>\n`;
    }
    xml += "  </url>\n";
  }
  xml += "</urlset>";
  return xml;
}

export async function fetchSitemapJson(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${normalized}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export function xmlResponse(body) {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

/** Use manual XML from API when set; otherwise build from auto entries/urls. */
export function resolveSitemapXml(data, buildAuto) {
  if (data?.source === "manual" && data?.xml) {
    return data.xml;
  }
  return buildAuto(data);
}
