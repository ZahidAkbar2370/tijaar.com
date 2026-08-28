"use client";

import FcmLoader from "@/components/FcmLoader";
import { AuthProvider } from "@/context/AuthProvider";
import { SnackbarProvider } from "@/context/SnackbarContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { MarketProvider } from "@/context/MarketContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import ClientSeoHead from "@/components/common/ClientSeoHead";
import TypographyStyles from "@/components/common/TypographyStyles";

export function Providers({ children }) {
  return (
    <SnackbarProvider>
      <SiteSettingsProvider>
        <MarketProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <TypographyStyles />
                <ClientSeoHead />
                {children}
                <FcmLoader />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </MarketProvider>
      </SiteSettingsProvider>
    </SnackbarProvider>
  );
}
