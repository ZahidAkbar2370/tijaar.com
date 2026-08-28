import ProtectedRoute from "@/components/ProtectedRoute";
import VendorProfile from "./VendorProfile";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Profile",
    description: "Manage your Tijaar seller profile and account settings.",
    path: "/seller/profile",
    noIndex: true,
  });
}

export default function VendorProfilePage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorProfile />
    </ProtectedRoute>
  );
}
