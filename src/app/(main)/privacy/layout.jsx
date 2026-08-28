import { generateCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "privacy",
    "Privacy Policy",
    "How Tijaar collects, uses, and protects your personal data."
  );
}

export default function PrivacyLayout({ children }) {
  return children;
}
