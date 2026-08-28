/** Inlined on homepage so hero/LCP paints before the Tailwind CSS chunk loads. */
export const HERO_CRITICAL_CSS = `
.hero-shell{position:relative;overflow:hidden;min-height:520px;isolation:isolate}
@media(min-width:1024px){.hero-shell{min-height:580px}}
.hero-shell .hero-lcp-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none}
.hero-shell .hero-lcp-overlay{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(to right,rgba(255,255,255,.95),rgba(255,255,255,.9) 50%,rgba(255,255,255,.75))}
.hero-content-layer{position:relative;z-index:10;width:100%;min-height:520px;padding:1.5rem 1rem}
@media(min-width:1024px){.hero-content-layer{min-height:580px;padding:2rem 2rem}}
.swiper{margin-left:auto;margin-right:auto;position:relative;overflow:hidden;list-style:none;padding:0;z-index:1;display:block}
.swiper-wrapper{position:relative;width:100%;height:100%;z-index:1;display:flex;box-sizing:content-box}
.swiper-slide{flex-shrink:0;width:100%;height:100%;position:relative}
`;
