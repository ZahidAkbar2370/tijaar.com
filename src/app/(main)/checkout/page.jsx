import CheckoutContent from "./CheckoutContent";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Checkout",
    description: "Complete your Tijaar order securely.",
    path: "/checkout",
    noIndex: true,
  });
}

export default function CheckoutPage() {
  return <CheckoutContent />;
}
