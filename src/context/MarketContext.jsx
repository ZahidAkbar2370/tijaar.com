"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const MARKET_KEY = "tijaar_market";

const MARKETS = {
  PK: { code: "PK", name: "Pakistan", currency: "PKR", symbol: "₨" },
  AE: { code: "AE", name: "Pakistan", currency: "AED", symbol: "د.إ" },
};

const MarketContext = createContext(null);

export const MarketProvider = ({ children }) => {
  const [market, setMarketState] = useState("PK");
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(MARKET_KEY);
    if (saved && (saved === "PK" || saved === "AE")) setMarketState(saved);
  }, []);

  const setMarket = useCallback((code) => {
    if (code !== "PK" && code !== "AE") return;
    setMarketState(code);
    if (typeof window !== "undefined") localStorage.setItem(MARKET_KEY, code);
  }, []);

  const formatPrice = useCallback((price, currencyOverride = null) => {
    const m = MARKETS[market];
    const sym = currencyOverride ? (MARKETS[currencyOverride]?.symbol || "₨") : m.symbol;
    let amount = Number(price) || 0;
    if (market === "AE" && exchangeRate) amount = amount * exchangeRate;
    return `${sym} ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }, [market, exchangeRate]);

  const value = useMemo(
    () => ({
      market,
      setMarket,
      marketInfo: MARKETS[market],
      exchangeRate,
      setExchangeRate,
      formatPrice,
      currency: MARKETS[market].currency,
      symbol: MARKETS[market].symbol,
    }),
    [market, setMarket, exchangeRate, formatPrice]
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
};

export const useMarket = () => {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
};
