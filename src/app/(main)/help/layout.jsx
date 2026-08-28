import { generateCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "help",
    "Help Center",
    "Find answers and support for using Tijaar."
  );
}

export default function HelpLayout({ children }) {
  return children;
}
