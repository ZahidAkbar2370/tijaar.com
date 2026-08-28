"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ChevronRight, Loader2, Calendar, User, ArrowLeft, FileText, TrendingUp } from "lucide-react";
import { cmsApi } from "@/lib/api";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { useSeoH1 } from "@/hooks/useSeoH1";
import { sanitizeRichTextHtml } from "@/lib/sanitizeRichText";

export default function BlogPage() {
  const params = useParams();
  const slug = params?.slug;
  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [popularBlogs, setPopularBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const blogTitle = blog?.blog_name || blog?.title || "";
  const blogH1 = useSeoH1("blog", { title: blogTitle, fallback: blogTitle || "Blog" });

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const [blogRes, recentRes, popularRes] = await Promise.all([
          cmsApi.blog(slug),
          cmsApi.blogs({ per_page: 5 }),
          cmsApi.blogs({ per_page: 5, sort: "popular" }),
        ]);
        setBlog(blogRes.blog);
        setRecentBlogs(recentRes.blogs || []);
        setPopularBlogs(popularRes.blogs || []);
      } catch (e) {
        setError(e?.data?.message || "Blog not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-[#1790d7] animate-spin" />
      </div>
    );
  }
  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{error || "Blog not found"}</h2>
          <Link href="/blogs" className="text-[#1790d7] font-medium hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = blog.published_at ? new Date(blog.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  const excludeCurrent = (list) => (list || []).filter((b) => b.slug !== slug);

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Breadcrumb */}
      <div className="bg-[#1790d7]/10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 max-w-6xl min-w-0">
          <nav className="flex items-center justify-start gap-2 text-sm text-[#0d6fa8] font-medium flex-wrap">
            <Link href="/" className="flex items-center gap-1 hover:text-[#1790d7] transition-colors">
              <Home className="w-4 h-4 shrink-0" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
            <Link href="/blogs" className="hover:text-[#1790d7] transition-colors">Blog</Link>
            <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
            <span className="text-gray-700 truncate max-w-[180px] sm:max-w-xs" title={blog.title}>
              {blog.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: main article card */}
          <div className="flex-1 min-w-0 lg:max-w-[calc(100%-280px)]">
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              {/* Featured image: always show (image or placeholder) */}
              <div className="aspect-[21/9] sm:aspect-[2/1] w-full bg-gray-100 overflow-hidden">
                {blog.featured_image ? (
                  <img
                    src={blog.featured_image}
                    alt={resolveImageAlt(blog.featured_image_alt, blog.title || IMAGE_ALT_FALLBACKS.blog)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1790d7]/20 to-[#4db3e8]/20">
                    <FileText className="w-16 h-16 text-[#1790d7]/40" />
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
                  {blogH1}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                  {blog.author && (
                    <span className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[#1790d7]/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-[#1790d7]" />
                      </span>
                      <span className="font-medium text-gray-700">{blog.author}</span>
                    </span>
                  )}
                  {publishedDate && (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {publishedDate}
                    </span>
                  )}
                </div>

                <div
                  className="rich-text-content blog-content max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(blog.content) || "<p>No content available.</p>" }}
                />
              </div>
            </motion.article>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[#1790d7] font-medium hover:bg-[#1790d7]/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
            </motion.div>
          </div>

          {/* Right: sidebar - Recent & Popular */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1790d7]" />
                Recent Posts
              </h3>
              <ul className="space-y-3">
                {excludeCurrent(recentBlogs).slice(0, 5).map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/blog/${b.slug}`}
                      className="block group text-sm text-gray-600 hover:text-[#1790d7] transition-colors"
                    >
                      <span className="line-clamp-2 group-hover:underline">{b.title}</span>
                      {b.published_at && (
                        <span className="text-xs text-gray-400 mt-0.5 block">
                          {new Date(b.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
                {excludeCurrent(recentBlogs).length === 0 && (
                  <li className="text-sm text-gray-500">No other posts yet.</li>
                )}
              </ul>
              <Link href="/blogs" className="mt-4 inline-block text-sm font-medium text-[#1790d7] hover:underline">
                View all →
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#1790d7]" />
                Popular Posts
              </h3>
              <ul className="space-y-3">
                {excludeCurrent(popularBlogs).slice(0, 5).map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/blog/${b.slug}`}
                      className="flex gap-3 group"
                    >
                      {b.featured_image ? (
                        <img
                          src={b.featured_image}
                          alt={resolveImageAlt(b.featured_image_alt, b.title || IMAGE_ALT_FALLBACKS.blog)}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-[#1790d7]/10 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-[#1790d7]/50" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600 group-hover:text-[#1790d7] line-clamp-2 group-hover:underline block">
                          {b.title}
                        </span>
                        {b.published_at && (
                          <span className="text-xs text-gray-400 mt-0.5 block">
                            {new Date(b.published_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
                {excludeCurrent(popularBlogs).length === 0 && (
                  <li className="text-sm text-gray-500">No other posts yet.</li>
                )}
              </ul>
              <Link href="/blogs" className="mt-4 inline-block text-sm font-medium text-[#1790d7] hover:underline">
                View all →
              </Link>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
}
