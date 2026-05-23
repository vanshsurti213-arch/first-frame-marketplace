"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { BrandSession } from "@/types";

const STORAGE_KEY = "firstframe_brand_session";

interface BrandContextType {
  brand: BrandSession | null;
  loading: boolean;
  setBrandSession: (session: BrandSession) => void;
  clearSession: () => void;
}

const BrandContext = createContext<BrandContextType>({
  brand: null,
  loading: true,
  setBrandSession: () => {},
  clearSession: () => {},
});

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<BrandSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BrandSession;
        if (parsed.brandId && parsed.companyName && parsed.campaignId) {
          setBrand(parsed);
          // Also set cookie for middleware
          document.cookie = `firstframe_brand_session=${encodeURIComponent(stored)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const setBrandSession = useCallback((session: BrandSession) => {
    setBrand(session);
    const serialized = JSON.stringify(session);
    localStorage.setItem(STORAGE_KEY, serialized);
    document.cookie = `firstframe_brand_session=${encodeURIComponent(serialized)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  }, []);

  const clearSession = useCallback(() => {
    setBrand(null);
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = "firstframe_brand_session=; path=/; max-age=0";
    router.push("/brand/login");
  }, [router]);

  return (
    <BrandContext.Provider value={{ brand, loading, setBrandSession, clearSession }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
