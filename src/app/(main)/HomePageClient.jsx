"use client";

import dynamic from "next/dynamic";
import { Star, Zap } from "lucide-react";
import { HomeDataProvider } from "@/context/HomeDataContext";
import Hero from "@/components/home/Hero";
import BrandsSlider from "@/components/home/BrandsSlider";
import CategoryProductsSection from "@/components/home/CategoryProductsSection";
import PromotionProductsSection from "@/components/home/PromotionProductsSection";
import FeaturedShopsSection from "@/components/home/FeaturedShopsSection";

const AllProductsSection = dynamic(() => import("@/components/home/AllProductsSection"), { ssr: false, loading: () => <section className="min-h-[200px]" aria-hidden /> });
const RecentProductsSection = dynamic(() => import("@/components/home/RecentProductsSection"), { ssr: false, loading: () => <section className="min-h-[200px]" aria-hidden /> });
const AllCategory = dynamic(() => import("@/components/home/AllCategory"), { ssr: false, loading: () => <section className="min-h-[120px]" aria-hidden /> });
const StatsCounter = dynamic(() => import("@/components/home/StatsCounter"), { ssr: false, loading: () => <section className="min-h-[120px]" aria-hidden /> });
const Testimonials = dynamic(() => import("@/components/home/Testimonials"), { ssr: false, loading: () => <section className="min-h-[120px]" aria-hidden /> });
const AppDownload = dynamic(() => import("@/components/home/AppDownload"), { ssr: false, loading: () => <section className="min-h-[120px]" aria-hidden /> });
const Newsletter = dynamic(() => import("@/components/home/Newsletter"), { ssr: false, loading: () => <section className="min-h-[120px]" aria-hidden /> });

export default function HomePageClient({ initialHomeData = null, heroBackground = null }) {
  return (
    <HomeDataProvider initialData={initialHomeData}>
      <div className="hero-shell">
        {heroBackground}
        <Hero />
      </div>
      <div className="overflow-hidden bg-white relative z-10">
        <PromotionProductsSection
          dataKey="featured_products"
          title="Featured Products"
          subtitle="Paid featured listings — diamond badge on promoted items"
          icon={Star}
        />
        <PromotionProductsSection
          dataKey="hot_sale_products"
          title="Hot Sale / Flash Deals"
          subtitle="Paid hot packages — Hot Deal label on promoted items"
          icon={Zap}
        />
        <FeaturedShopsSection />
        <BrandsSlider />
        <CategoryProductsSection />
        <AllProductsSection />
        <RecentProductsSection />
        <AllCategory />
        <StatsCounter />
        <Testimonials />
        <AppDownload />
        <Newsletter />
      </div>
    </HomeDataProvider>
  );
}
