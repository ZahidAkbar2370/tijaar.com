import ProtectedRoute from "@/components/ProtectedRoute";
import VendorDashboard from "./VendorDashboard";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Seller Dashboard",
    description: "Manage your Tijaar seller store.",
    path: "/seller/dashboard",
    noIndex: true,
  });
}

export default function VendorDashboardPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorDashboard />
    </ProtectedRoute>
  );
}
