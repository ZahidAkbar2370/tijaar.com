import "./globals.css";
import Script from "next/script";
import { Providers } from "./providers";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import Snackbar from "@/components/common/Snackbar";
import FaviconUpdater from "@/components/common/FaviconUpdater";
import { generateRootMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateRootMetadata();
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-M7M6ZP7NM8"
          strategy="afterInteractive"
        />
        <Script id="google-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-M7M6ZP7NM8');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <FaviconUpdater />
          {children}
          <ScrollToTopButton />
          <Snackbar />
        </Providers>
      </body>
    </html>
  );
}
