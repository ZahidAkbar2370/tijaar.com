import { fetchSiteSettings, getSiteUrl } from "@/lib/seo";

export const FALLBACK_LLM_TXT = `# Tijaar

> Online shopping marketplace in Pakistan. Buy and sell from verified sellers with secure payments and nationwide delivery.

## About

Tijaar is a multi-vendor e-commerce marketplace where buyers discover products from trusted sellers across Pakistan.

## Canonical site

${getSiteUrl()}

## Key pages

- Home: ${getSiteUrl()}/
- Shop: ${getSiteUrl()}/shop
- Categories: ${getSiteUrl()}/all-categories
- Best sellers: ${getSiteUrl()}/best-sellers
- Flash deals: ${getSiteUrl()}/flash-deals
- Sellers: ${getSiteUrl()}/sellers
- Blog: ${getSiteUrl()}/blogs
- About: ${getSiteUrl()}/about
- Contact: ${getSiteUrl()}/contact
- FAQs: ${getSiteUrl()}/faqs
- How it works: ${getSiteUrl()}/how-it-works

## Policies

- Terms: ${getSiteUrl()}/terms
- Privacy: ${getSiteUrl()}/privacy
- Returns & refunds: ${getSiteUrl()}/returns-refunds
- Shipping: ${getSiteUrl()}/shipping
- Cookie policy: ${getSiteUrl()}/cookie-policy
- Help: ${getSiteUrl()}/help

## Sitemap

${getSiteUrl()}/sitemap.xml

## Contact

Support and business inquiries: ${getSiteUrl()}/contact
`;

export async function getLlmTxtBody() {
  const settings = await fetchSiteSettings({ noStore: true });
  return settings?.llm_txt?.trim() || FALLBACK_LLM_TXT;
}

export function llmTxtResponse(body) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
