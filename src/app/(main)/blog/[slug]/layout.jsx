import { buildPageMetadata, fetchApi, fetchSiteSettings, stripHtml } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [settings, data] = await Promise.all([
    fetchSiteSettings(),
    fetchApi(`/blog/${slug}`, 60),
  ]);
  const blog = data?.blog;
  if (!blog) {
    return buildPageMetadata({
      title: "Blog Post Not Found",
      path: `/blog/${slug}`,
      siteSettings: settings,
    });
  }
  const hasMetaTitle = Boolean(blog.meta_title?.trim());
  return buildPageMetadata({
    title: hasMetaTitle ? blog.meta_title : blog.title,
    description:
      blog.meta_description?.trim() ||
      stripHtml(blog.excerpt || blog.content || "").slice(0, 160) ||
      `Read ${blog.title} on the Tijaar blog.`,
    keywords: blog.meta_keywords?.trim() ? blog.meta_keywords : undefined,
    image: blog.featured_image,
    path: `/blog/${slug}`,
    siteSettings: settings,
    exactTitle: hasMetaTitle,
  });
}

export default function BlogPostLayout({ children }) {
  return children;
}
