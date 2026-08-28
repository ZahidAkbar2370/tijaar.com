import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Reset Password",
    description: "Choose a new password for your Tijaar account.",
    path: "/reset-password",
    noIndex: true,
  });
}

export default function ResetPasswordLayout({ children }) {
  return children;
}
