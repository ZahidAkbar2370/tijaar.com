import TermsContent from "./TermsContent";
import { generateCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "terms",
    "Terms of Service",
    "Terms of use for buyers and sellers on Tijaar."
  );
}

export default function TermsPage() {
  return <TermsContent />;
}
