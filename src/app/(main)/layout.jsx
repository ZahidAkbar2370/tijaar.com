import Navbar from "@/components/common/Navbar";
import ConditionalCategoryMenu from "@/components/common/ConditionalCategoryMenu";
import Footer from "@/components/common/Footer";
import SwiperCssLoader from "@/components/common/SwiperCssLoader";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ConditionalCategoryMenu />
      <SwiperCssLoader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
