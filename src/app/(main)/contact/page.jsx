import ContactContent from "./ContactContent";
import { generateCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "contact",
    "Contact Us",
    "Get in touch with the Tijaar support team."
  );
}

export default function ContactPage() {
  return <ContactContent />;
}
