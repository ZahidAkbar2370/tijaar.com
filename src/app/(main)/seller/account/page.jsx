import ProtectedRoute from "@/components/ProtectedRoute";
import VendorAccount from "./VendorAccount";

export default function VendorAccountPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorAccount />
    </ProtectedRoute>
  );
}
