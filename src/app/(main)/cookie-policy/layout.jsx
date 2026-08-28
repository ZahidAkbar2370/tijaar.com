import { generateCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "cookie-policy",
    "Cookie Policy",
    "How Tijaar uses cookies on the website."
  );
}

export default function CookiePolicyLayout({ children }) {
  return children;
}
