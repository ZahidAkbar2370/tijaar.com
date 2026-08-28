import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modernPolyfill = path.join(__dirname, "src/lib/modern-polyfill.js");

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "swiper"],
    // optimizeCss (critters) can strip Tailwind/Swiper utilities and break layouts
  },
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  transpilePackages: ["framer-motion"],
  // Reduce Watchpack scanning system paths (Windows) to avoid EINVAL and speed dev
  webpack: (config, { dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "../build/polyfills/polyfill-module": modernPolyfill,
      "next/dist/build/polyfills/polyfill-module": modernPolyfill,
    };
    if (dev) {
      const base = config.watchOptions?.ignored && Array.isArray(config.watchOptions.ignored) ? config.watchOptions.ignored : [];
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          ...base,
          "**/node_modules/**",
          "**/.next/**",
          "**/DumpStack.log.tmp",
          "**/System Volume Information/**",
          "**/pagefile.sys",
        ],
      };
    }
    return config;
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/blogs", permanent: true },
      { source: "/vendor", destination: "/seller", permanent: true },
      { source: "/vendor/:path*", destination: "/seller/:path*", permanent: true },
      { source: "/vendor/checkout", destination: "/checkout", permanent: true },
      { source: "/seller/checkout", destination: "/checkout", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/sitemap-products-:page.xml", destination: "/sitemap-products/:page" },
    ];
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: "</assets/herobg-480.webp>; rel=preload; as=image; type=image/webp; media=(max-width:768px), </assets/herobg-1280.webp>; rel=preload; as=image; type=image/webp; media=(min-width:769px)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
