"use client";

import dynamic from "next/dynamic";
import { HomeDataProvider } from "@/context/HomeDataContext";
import Hero from "@/components/home/Hero";
import CategoryProductsSection from "@/components/home/CategoryProductsSection";
import PromotionProductsSection from "@/components/home/PromotionProductsSection";
import FeaturedShopsSection from "@/components/home/FeaturedShopsSection";

const AllProductsSection = dynamic(() => import("@/components/home/AllProductsSection"), { ssr: false, loading: () => <section className="min-h-[200px]" aria-hidden /> });
const RecentProductsSection = dynamic(() => import("@/components/home/RecentProductsSection"), { ssr: false, loading: () => <section className="min-h-[200px]" aria-hidden /> });
// Set true later to show these sections again
const SHOW_BRANDS_SLIDER = false;
const SHOW_BROWSE_CATEGORIES = false;
const SHOW_STATS_COUNTER = false;

const BrandsSlider = SHOW_BRANDS_SLIDER
  ? dynamic(() => import("@/components/home/BrandsSlider"), { ssr: false, loading: () => <section className="min-h-[80px]" aria-hidden /> })
  : null;
const AllCategory = SHOW_BROWSE_CATEGORIES
  ? dynamic(() => import("@/components/home/AllCategory"), { ssr: false, loading: () => <section className="min-h-[120px]" aria-hidden /> })
  : null;
const StatsCounter = SHOW_STATS_COUNTER
  ? dynamic(() => import("@/components/home/StatsCounter"), { ssr: false, loading: () => <section className="min-h-[120px]" aria-hidden /> })
  : null;
const Testimonials = dynamic(() => import("@/components/home/Testimonials"), { ssr: false, loading: () => <section className="min-h-[120px]" aria-hidden /> });
// Set true later (or wire to CMS) to show app download again
const SHOW_APP_DOWNLOAD = false;
const AppDownload = SHOW_APP_DOWNLOAD
  ? dynamic(() => import("@/components/home/AppDownload"), { ssr: false, loading: () => <section className="min-h-[120px]" aria-hidden /> })
  : null;
// Set true later to show newsletter again
const SHOW_NEWSLETTER = false;
const Newsletter = SHOW_NEWSLETTER
  ? dynamic(() => import("@/components/home/Newsletter"), { ssr: false, loading: () => <section className="min-h-[120px]" aria-hidden /> })
  : null;

export default function HomePageClient({ initialHomeData = null, heroBackground = null }) {
  return (
    <HomeDataProvider initialData={initialHomeData}>
      <div className="hero-shell">
        {heroBackground}
        <Hero />
      </div>
      <div className="overflow-hidden bg-white relative z-10">
        <FeaturedShopsSection />
        <PromotionProductsSection
          dataKey="featured_products"
          title="Featured Products"
          subtitle="Paid featured listings with an active promotion package"
        />
        <PromotionProductsSection
          dataKey="hot_sale_products"
          title="Hot Sale / Flash Deals"
          subtitle="Paid hot packages with an active promotion — shown in random order"
        />
        {BrandsSlider ? <BrandsSlider /> : null}
        <CategoryProductsSection />
        <AllProductsSection />
        <RecentProductsSection />
        {AllCategory ? <AllCategory /> : null}
        {StatsCounter ? <StatsCounter /> : null}
        <Testimonials />
        {AppDownload ? <AppDownload /> : null}
        {Newsletter ? <Newsletter /> : null}
      </div>
    </HomeDataProvider>
  );
}
