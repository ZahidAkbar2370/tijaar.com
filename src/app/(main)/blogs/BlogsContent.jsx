"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FileText } from "lucide-react";
import { cmsApi } from "@/lib/api";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { useSeoH1 } from "@/hooks/useSeoH1";

const DEFAULT_BANNER = {
  title: "Blog",
  subtitle: "Tips, news, and stories from the Tijaar team and our community. Stay updated on marketplace news and selling tips.",
};

export default function BlogsContent() {
  const blogListH1 = useSeoH1("blog_list");
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(DEFAULT_BANNER);

  useEffect(() => {
    const load = async () => {
      try {
        const [blogsRes, pageRes] = await Promise.all([
          cmsApi.blogs({ per_page: 12 }),
          cmsApi.page("blog").catch(() => null),
        ]);
        setBlogs(blogsRes.blogs || []);
        setPagination(blogsRes.pagination || {});
        if (pageRes?.page) {
          const p = pageRes.page;
          setBanner({
            title: p.banner_title || p.title || DEFAULT_BANNER.title,
            subtitle: p.banner_subtitle || DEFAULT_BANNER.subtitle,
          });
        }
      } catch {
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-10 px-4 lg:px-8 animate-pulse">
        <div className="w-full">
          <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">{blogListH1}</h1>
        <p className="text-gray-500 text-center max-w-md mb-8">
          Tips, news, and stories from Tijaar. Check back soon for new posts.
        </p>
        <Link href="/" className="text-[#1790d7] font-semibold hover:underline">Back to Home</Link>
      </div>
    );
  }

  const [featured, ...rest] = blogs;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-[#1790d7]/10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 max-w-5xl xl:max-w-[85%] min-w-0">
          <nav className="flex items-center justify-start gap-2 text-sm text-[#0d6fa8] font-medium">
            <Link href="/" className="flex items-center gap-1 hover:text-[#1790d7] transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">{banner.title}</span>
          </nav>
        </div>
      </div>

      {/* Banner: editable from CMS -> Pages -> Blog */}
      <section className="bg-gradient-to-b from-[#1790d7] to-[#4db3e8] py-14 lg:py-20">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl xl:max-w-[85%] min-w-0">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center mb-5 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold text-white tracking-tight"
          >
            {blogListH1}
          </motion.h1>
          {banner.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mt-3 text-white/95 text-base lg:text-lg max-w-2xl mx-auto"
            >
              {banner.subtitle}
            </motion.p>
          )}
        </div>
      </section>

    <section className="py-10 px-4 lg:px-8">
      <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">Recent Posts</h2>
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-10 mb-12">
          {featured && (
            <div className="w-full lg:w-[55%]">
              <Link href={`/blog/${featured.slug}`}>
                <div className="h-64 w-full overflow-hidden rounded-xl">
                  <img
                    src={featured.featured_image || "/assets/sample-image.webp"}
                    alt={resolveImageAlt(featured.featured_image_alt, featured.title || IMAGE_ALT_FALLBACKS.blog)}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  <Link href={`/blog/${featured.slug}`} className="hover:text-[#1790d7]">
                    {featured.title}
                  </Link>
                </h3>
                <p className="text-gray-500 text-sm mb-3">
                  {featured.author} •{" "}
                  {featured.published_at
                    ? new Date(featured.published_at).toLocaleDateString()
                    : ""}
                </p>
                <p className="text-gray-600 mb-4 line-clamp-3">{featured.excerpt || ""}</p>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="inline-block py-2 px-4 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl text-sm font-medium"
                >
                  Read More
                </Link>
              </div>
            </div>
          )}
          <div className="w-full lg:w-[45%] flex flex-col gap-6">
            {rest.slice(0, 3).map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex gap-4 p-4 rounded-xl hover:bg-gray-50"
                >
                  <div className="w-24 h-24 shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={blog.featured_image || "/assets/sample-image.webp"}
                      alt={resolveImageAlt(blog.featured_image_alt, blog.title || IMAGE_ALT_FALLBACKS.blog)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{blog.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {blog.author} • {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : ""}
                    </p>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{blog.excerpt || ""}</p>
                    <span className="text-[#1790d7] text-sm font-medium mt-2 inline-block">
                      Read More →
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {rest.length > 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.slice(3).map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={blog.featured_image || "/assets/sample-image.webp"}
                      alt={resolveImageAlt(blog.featured_image_alt, blog.title || IMAGE_ALT_FALLBACKS.blog)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{blog.title}</h3>
                    <p className="text-gray-500 text-xs mt-2">
                      {blog.author} • {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : ""}
                    </p>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{blog.excerpt || ""}</p>
                    <span className="text-[#1790d7] text-sm font-medium mt-3 inline-block">
                      Read More →
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
    </div>
  );
}
