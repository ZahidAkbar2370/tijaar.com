import { useParams } from "react-router-dom";
import useApiQuery from "../../hooks/useApiQuery";
import axiosInstance, { imageURL } from "../../api/axiosInstance";
import DotsLoader from "../common/DotsLoader";

const BlogDetail = () => {
  const { slug } = useParams();

  const { data, isLoading, isError } = useApiQuery(
    ["blog", slug],
    async () => {
      const res = await axiosInstance.get(`/blog/${slug}`);
      return res?.data?.data || res?.data || null;
    },
    {
      enabled: !!slug,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  if (isLoading) {
    return (
      <section className="p-16 flex items-center justify-center">
        <DotsLoader size="md" />
      </section>
    );
  }

  if (isError || !data) {
    return <h2 className="p-16 text-center text-2xl font-semibold">Blog not found</h2>;
  }

  const heroImg = data.thumbnail
    ? data.thumbnail.startsWith("http")
      ? data.thumbnail
      : `${imageURL}${data.thumbnail}`
    : "/assets/sample-image.webp";

  const authorImg = data.author_image
    ? data.author_image.startsWith("http")
      ? data.author_image
      : `${imageURL}${data.author_image}`
    : "/assets/sample-image.webp";

  return (
    <section className="py-10 px-6 md:px-12 w-full">
      <img
        src={heroImg}
        className="w-full h-[350px] object-cover rounded-xl mb-10"
      />

      <h1 className="text-3xl font-bold text-primary mb-4">
        {data.title}
      </h1>

      <div className="flex items-center gap-3 mb-6">
        <img
          src={authorImg}
          className="w-10 h-10 rounded-full object-cover"
        />
        <p className="text-gray-500 text-sm">
          {data.author_name} •{" "}
          {data.created_at
            ? new Date(data.created_at).toLocaleDateString("en-GB").replaceAll("/", "-")
            : ""}
        </p>
      </div>

      <p className="text-gray-600 text-base leading-relaxed">
        {data.description}
      </p>
    </section>
  );
};

export default BlogDetail;
