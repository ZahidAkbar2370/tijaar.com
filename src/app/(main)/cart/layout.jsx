import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Shopping Cart",
    description: "Review items in your Tijaar shopping cart.",
    path: "/cart",
    noIndex: true,
  });
}

export default function CartLayout({ children }) {
  return children;
}
