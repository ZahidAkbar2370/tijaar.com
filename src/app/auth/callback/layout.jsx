import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Signing In",
    description: "Completing sign in to your Tijaar account.",
    path: "/auth/callback",
    noIndex: true,
  });
}

export default function AuthCallbackLayout({ children }) {
  return children;
}
