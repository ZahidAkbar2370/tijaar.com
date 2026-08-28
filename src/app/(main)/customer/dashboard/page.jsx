import ProtectedRoute from "@/components/ProtectedRoute";
import CustomerDashboard from "./CustomerDashboard";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "My Dashboard",
    description: "Your Tijaar customer account dashboard.",
    path: "/customer/dashboard",
    noIndex: true,
  });
}

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerDashboard />
    </ProtectedRoute>
  );
}
