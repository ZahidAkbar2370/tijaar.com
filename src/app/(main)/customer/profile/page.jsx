import ProtectedRoute from "@/components/ProtectedRoute";
import CustomerProfile from "./CustomerProfile";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Profile",
    description: "Manage your Tijaar customer profile.",
    path: "/customer/profile",
    noIndex: true,
  });
}

export default function CustomerProfilePage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerProfile />
    </ProtectedRoute>
  );
}
