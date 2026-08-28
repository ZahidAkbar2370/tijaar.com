"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

export default function BlogDetail({ blog }) {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#1790d7] flex items-center gap-1"><Home className="w-4 h-4" /> Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/blogs" className="hover:text-[#1790d7]">Blogs</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{blog.blog_name || blog.title}</span>
          </div>
        </div>
      </div>
      <article className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{blog.blog_name || blog.title}</h1>
        <p className="text-gray-500 mb-6">{blog.author} • {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : ""}</p>
        <img src={blog.thumbnail || "/assets/sample-image.webp"} alt={blog.blog_name} className="w-full h-64 object-cover rounded-2xl mb-8" />
        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="whitespace-pre-line">{blog.description || "No content available."}</p>
        </div>
      </article>
    </div>
  );
}
