"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/lib/firebaseUtils";

export type Currency = "INR" | "USD";

interface CurrencyContextType {
  currency: Currency;
  symbol: string;
  conversionRate: number; // fallback conversion rate
  countryCode: string;
  formatPrice: (amountInINR: number | undefined) => string; // legacy method
  formatProductPrice: (product: Partial<Product>) => string;
  getProductPrice: (product: Partial<Product>) => number;
  getProductMrp: (product: Partial<Product>) => number | undefined;
  toggleCurrency: () => void;
  setRegion: (code: string, curr: Currency) => void;
  rawFormat: (amountInINR: number | undefined) => number;
}

const defaultContextValue: CurrencyContextType = {
  currency: "INR",
  symbol: "₹",
  conversionRate: 83,
  countryCode: "IN",
  formatPrice: (amount) => `₹${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  formatProductPrice: () => "₹0.00",
  getProductPrice: () => 0,
  getProductMrp: () => undefined,
  toggleCurrency: () => {},
  setRegion: () => {},
  rawFormat: (amount) => amount || 0,
};

const CurrencyContext = createContext<CurrencyContextType>(defaultContextValue);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [countryCode, setCountryCode] = useState<string>("IN");
  const conversionRate = 83; // 1 USD = 83 INR fallback

  useEffect(() => {
    const cachedCountry = localStorage.getItem('userCountry');
    const cachedCurrency = localStorage.getItem('userCurrency');

    if (cachedCountry && cachedCurrency) {
      setCountryCode(cachedCountry);
      setCurrency(cachedCurrency as Currency);
    } else {
      // Default to IN/INR and cache it instantly
      setCountryCode('IN');
      setCurrency('INR');
      localStorage.setItem('userCountry', 'IN');
      localStorage.setItem('userCurrency', 'INR');
    }
  }, []);

  const symbol = currency === "INR" ? "₹" : "$";

  const rawFormat = (amountInINR: number | undefined) => {
    if (amountInINR === undefined || amountInINR === null) return 0;
    if (currency === "INR") return amountInINR;
    return amountInINR / conversionRate;
  };

  const formatPrice = (amountInINR: number | undefined) => {
    if (amountInINR === undefined || amountInINR === null) return `${symbol}0.00`;
    
    if (currency === "INR") {
      return `₹${amountInINR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const inUSD = amountInINR / conversionRate;
      return `$${inUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const getProductPrice = (product: Partial<Product>) => {
    if (!product || product.price === undefined) return 0;
    if (currency === "INR") return product.price;
    // For USD: Use exact USD price if available, else use fallback
    if (product.priceUSD !== undefined) return product.priceUSD;
    return product.price / conversionRate;
  };

  const getProductMrp = (product: Partial<Product>) => {
    if (!product || product.mrp === undefined) return undefined;
    if (currency === "INR") return product.mrp;
    // For USD: Use exact USD MRP if available, else use fallback
    if (product.mrpUSD !== undefined) return product.mrpUSD;
    return product.mrp / conversionRate;
  };

  const formatProductPrice = (product: Partial<Product>) => {
    if (!product || product.price === undefined) return `${symbol}0.00`;
    const price = getProductPrice(product);
    return symbol + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const toggleCurrency = () => {
    setCurrency(prev => {
      const newCurr = prev === "INR" ? "USD" : "INR";
      localStorage.setItem('userCurrency', newCurr);
      return newCurr;
    });
  };

  const setRegion = (code: string, curr: Currency) => {
    setCountryCode(code);
    setCurrency(curr);
    localStorage.setItem('userCountry', code);
    localStorage.setItem('userCurrency', curr);
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, conversionRate, countryCode, formatPrice, formatProductPrice, getProductPrice, getProductMrp, toggleCurrency, setRegion, rawFormat }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
