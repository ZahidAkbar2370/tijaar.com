import BlogsContent from "./BlogsContent";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Blog",
    description: "Tips, news, and stories from the Tijaar marketplace.",
    path: "/blogs",
  });
}

export default function BlogsPage() {
  return <BlogsContent />;
}
