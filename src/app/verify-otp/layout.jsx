import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Verify OTP",
    description: "Verify your Tijaar account with a one-time code.",
    path: "/verify-otp",
    noIndex: true,
  });
}

export default function VerifyOtpLayout({ children }) {
  return children;
}
