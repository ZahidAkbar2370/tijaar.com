import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useApiQuery from "../../hooks/useApiQuery";
import axiosInstance, { imageURL } from "../../api/axiosInstance";


const RecentBlogs = () => {
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const { data, isLoading, isError } = useApiQuery(
    ["blogs"],
    async () => {
      const res = await axiosInstance.get("/blogs");
      return res?.data || {};
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const blogs = useMemo(() => {
    const list = data?.data || data || [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  const stripHtml = (html) => html || "";

  if (isLoading) {
    return (
      <section className="py-10 px-6 md:px-12 flex items-center justify-center">
        <DotsLoader size="md" />
      </section>
    );
  }

  if (isError || !blogs.length) {
    return null;
  }

  const featured = blogs[0];
  const smallBlogs = blogs.slice(1, 4);
  const extraBlogs = blogs.slice(4);

  const visibleExtraBlogs = showMore ? extraBlogs : extraBlogs.slice(0, 3);

  return (
    <section className="py-10 px-6 md:px-12">
      <h2 className="text-3xl font-bold text-center mb-20">Recent Blogs</h2>

      <div className="flex flex-col lg:flex-row gap-10 w-full">
        {featured && (
          <div className="w-full lg:w-[55%] overflow-hidden ">
            <div className="h-64 w-full overflow-hidden">
              <img
                src={
                  featured.thumbnail?.startsWith("http")
                    ? featured.thumbnail
                    : featured.thumbnail
                    ? `${imageURL}${featured.thumbnail}`
                    : "/assets/sample-image.webp"
                }
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-semibold text-primary mb-3">
                {featured.blog_name}
              </h3>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={
                    featured.author_image?.startsWith("http")
                      ? featured.author_image
                      : featured.author_image
                      ? `${imageURL}${featured.author_image}`
                      : "/assets/sample-image.webp"
                  }
                  className="w-9 h-9 rounded-full object-cover"
                />
                <p className="text-gray-500 text-sm">
                  {featured.author} •{" "}
                  {new Date(featured.created_at)
                    .toLocaleDateString("en-GB")
                    .replaceAll("/", "-")}
                </p>
              </div>

              <p className="text-gray-600 text-base leading-relaxed mb-4">
                {stripHtml(featured.description).slice(0, 380)}...
              </p>

              <button
                onClick={() =>
                  navigate(`/blog/${featured.slug}`)
                }
                className="mt-3 py-1 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] border border-gray-300 rounded-xl text-white text-xs w-25   cursor-pointer transition"
              >
                Read More
              </button>
            </div>
          </div>
        )}

        <div className="w-full lg:w-[45%] flex flex-col gap-10">
          {smallBlogs.map((blog) => (
            <div key={blog.id || blog.slug} className="flex overflow-hidden transition">
              <div className="w-45 h-38 flex-shrink-0 overflow-hidden">
                <img
                  src={
                    blog.thumbnail?.startsWith("http")
                      ? blog.thumbnail
                      : blog.thumbnail
                      ? `${imageURL}${blog.thumbnail}`
                      : "/assets/sample-image.webp"
                  }
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="px-6 flex flex-col justify-between">
                <h3 className="text-base font-semibold text-primary leading-tight">
                  {blog.blog_name}
                </h3>

                <div className="flex items-center gap-2 mt-2">
                  <img
                  src={
                    blog.author_image?.startsWith("http")
                      ? blog.author_image
                      : blog.author_image
                      ? `${imageURL}${blog.author_image}`
                      : "/assets/sample-image.webp"
                  }
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <p className="text-gray-500 text-xs">
                    {blog.author} •{" "}
                    {new Date(blog.created_at)
                      .toLocaleDateString("en-GB")
                      .replaceAll("/", "-")}
                  </p>
                </div>

                <p className="text-gray-600 text-xs mt-2 leading-snug">
                  {stripHtml(blog.description).slice(0, 40)}...
                </p>

                <button
                onClick={() => navigate(`/blog/${blog.slug}`)}
                  className="mt-3 py-1 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] border border-gray-300 rounded-xl text-white text-xs w-25  hover:text-white cursor-pointer transition"
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {extraBlogs.length > 0 && (
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {visibleExtraBlogs.map((blog) => (
            <div key={blog.id || blog.slug} className="overflow-hidden transition w-[350px]">
              <img
                src={
                  blog.thumbnail?.startsWith("http")
                    ? blog.thumbnail
                    : blog.thumbnail
                    ? `${imageURL}${blog.thumbnail}`
                    : "/assets/sample-image.webp"
                }
                className="h-48 w-full object-cover"
              />

              <div className="p-5">
                <h3 className="text-lg font-semibold text-primary">
                  {blog.blog_name}
                </h3>

                <div className="flex items-center gap-3 mt-3 mb-3">
                  <img
                    src={
                      blog.author_image?.startsWith("http")
                        ? blog.author_image
                        : blog.author_image
                        ? `${imageURL}${blog.author_image}`
                        : "/assets/sample-image.webp"
                    }
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <p className="text-gray-500 text-xs">
                    {blog.author} •{" "}
                    {new Date(blog.created_at)
                      .toLocaleDateString("en-GB")
                      .replaceAll("/", "-")}
                  </p>
                </div>

                <p className="text-gray-600 text-sm leading-snug">
                  {stripHtml(blog.description).slice(0, 80)}...
                </p>

                <button
                onClick={() => navigate(`/blog/${blog.slug}`)}
                  className="mt-4 py-1 border border-gray-300 rounded-xl text-white text-xs w-25  cursor-pointer transition bg-gradient-to-r from-[#1790d7] to-[#4db3e8]"
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showMore && extraBlogs.length > 3 && (
        <div className="text-center mt-10">
          <button
            onClick={() => setShowMore(true)}
            className="py-2 px-6 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-lg shadow-md hover:bg-hoverColor cursor-pointer transition"
          >
            Load More Blogs
          </button>
        </div>
      )}
    </section>
  );
};

export default RecentBlogs;
