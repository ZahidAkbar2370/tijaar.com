import HomePageClient from "./HomePageClient";
import { generateCmsPageMetadata } from "@/lib/seo";
import { fetchHomeData, mapHomeApiResponse } from "@/lib/serverHome";
import HeroBackground, { getMobileHeroPreloadHref, getDesktopHeroPreloadHref } from "@/components/home/HeroBackground";
import { HERO_CRITICAL_CSS } from "@/lib/criticalHeroCss";
import { LOCAL_HERO_480, LOCAL_HERO_1280 } from "@/lib/imageOptimize";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "home",
    "Tijaar - Multi-Vendor Marketplace",
    "Buy and sell anything, anywhere. Pakistan marketplace."
  );
}

export default async function HomePage() {
  const res = await fetchHomeData();
  const initialHomeData = mapHomeApiResponse(res);
  const cmsBanner = initialHomeData?.banners?.[0] ?? null;
  const cmsImage = cmsBanner?.image && String(cmsBanner.image).trim();
  const useLocalHero = !cmsImage || cmsImage.startsWith("/");
  const mobilePreload = getMobileHeroPreloadHref(cmsBanner);
  const desktopPreload = getDesktopHeroPreloadHref(cmsBanner);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HERO_CRITICAL_CSS }} />
      {useLocalHero ? (
        <>
          <link
            rel="preload"
            href={LOCAL_HERO_480}
            as="image"
            type="image/webp"
            media="(max-width: 768px)"
            fetchPriority="high"
          />
          <link
            rel="preload"
            href={LOCAL_HERO_1280}
            as="image"
            type="image/webp"
            media="(min-width: 769px)"
            fetchPriority="high"
          />
        </>
      ) : (
        <>
          <link
            rel="preload"
            href={mobilePreload}
            as="image"
            media="(max-width: 768px)"
            fetchPriority="high"
          />
          <link
            rel="preload"
            href={desktopPreload}
            as="image"
            media="(min-width: 769px)"
            fetchPriority="high"
          />
        </>
      )}
      <HomePageClient
        initialHomeData={initialHomeData}
        heroBackground={<HeroBackground cmsBanner={cmsBanner} />}
      />
    </>
  );
}
