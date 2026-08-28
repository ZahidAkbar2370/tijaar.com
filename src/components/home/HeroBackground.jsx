import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import {
  optimizeImageUrl,
  IMAGE_WIDTHS,
  LOCAL_HERO_480,
  LOCAL_HERO_1280,
} from "@/lib/imageOptimize";

/** Server-rendered hero background — must stay a Server Component (outside client boundaries). */
export default function HeroBackground({ cmsBanner = null }) {
  const cmsImage = cmsBanner?.image && String(cmsBanner.image).trim();
  const heroAlt = resolveImageAlt(cmsBanner?.image_alt, IMAGE_ALT_FALLBACKS.heroBanner);
  const useLocal = !cmsImage || cmsImage.startsWith("/");
  const cmsSrc = useLocal
    ? LOCAL_HERO_1280
    : optimizeImageUrl(cmsImage, { width: IMAGE_WIDTHS.heroBanner, quality: 78 });

  return (
    <>
      {useLocal ? (
        <picture>
          <source media="(max-width: 768px)" srcSet={LOCAL_HERO_480} type="image/webp" />
          <img
            src={LOCAL_HERO_1280}
            alt={heroAlt}
            className="hero-lcp-img"
            fetchPriority="high"
            decoding="sync"
            width={1280}
            height={782}
          />
        </picture>
      ) : (
        <img
          src={cmsSrc}
          alt={heroAlt}
          className="hero-lcp-img"
          fetchPriority="high"
          decoding="sync"
        />
      )}
      <div className="hero-lcp-overlay" aria-hidden="true" />
    </>
  );
}

export function getMobileHeroPreloadHref(cmsBanner = null) {
  const cmsImage = cmsBanner?.image && String(cmsBanner.image).trim();
  if (cmsImage && !cmsImage.startsWith("/")) {
    return optimizeImageUrl(cmsImage, { width: 640, quality: 72 });
  }
  return LOCAL_HERO_480;
}

export function getDesktopHeroPreloadHref(cmsBanner = null) {
  const cmsImage = cmsBanner?.image && String(cmsBanner.image).trim();
  if (cmsImage && !cmsImage.startsWith("/")) {
    return optimizeImageUrl(cmsImage, { width: IMAGE_WIDTHS.heroBanner, quality: 78 });
  }
  return LOCAL_HERO_1280;
}
