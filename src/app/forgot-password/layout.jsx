import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Forgot Password",
    description: "Reset your Tijaar account password.",
    path: "/forgot-password",
    noIndex: true,
  });
}

export default function ForgotPasswordLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
