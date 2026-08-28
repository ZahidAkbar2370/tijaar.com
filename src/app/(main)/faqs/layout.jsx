import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "FAQs",
    description: "Frequently asked questions about shopping and selling on Tijaar.",
    path: "/faqs",
  });
}

export default function FaqsLayout({ children }) {
  return children;
}
