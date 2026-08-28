import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default function RegisterLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
