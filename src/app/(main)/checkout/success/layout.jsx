import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Order Confirmation",
    description: "Your Tijaar order was placed successfully.",
    path: "/checkout/success",
    noIndex: true,
  });
}

export default function CheckoutSuccessLayout({ children }) {
  return children;
}
