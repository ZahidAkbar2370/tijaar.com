import AboutContent from "./AboutContent";
import { generateCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "about",
    "About Us",
    "Learn about Tijaar — Pakistan's multi-vendor marketplace."
  );
}

export default function AboutPage() {
  return <AboutContent />;
}
