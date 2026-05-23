"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CreatorSession } from "@/types";

const STORAGE_KEY = "firstframe_creator_session";

interface CreatorContextType {
  creator: CreatorSession | null;
  loading: boolean;
  setCreatorSession: (session: CreatorSession) => void;
  clearSession: () => void;
}

const CreatorContext = createContext<CreatorContextType>({
  creator: null,
  loading: true,
  setCreatorSession: () => {},
  clearSession: () => {},
});

export function CreatorProvider({ children }: { children: React.ReactNode }) {
  const [creator, setCreator] = useState<CreatorSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CreatorSession;
        if (parsed.creatorId && parsed.creatorName) {
          setCreator(parsed);
          // Also set cookie for middleware
          document.cookie = `firstframe_creator_session=${encodeURIComponent(stored)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const setCreatorSession = useCallback((session: CreatorSession) => {
    setCreator(session);
    const serialized = JSON.stringify(session);
    localStorage.setItem(STORAGE_KEY, serialized);
    document.cookie = `firstframe_creator_session=${encodeURIComponent(serialized)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  }, []);

  const clearSession = useCallback(() => {
    setCreator(null);
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = "firstframe_creator_session=; path=/; max-age=0";
    router.push("/creator/join");
  }, [router]);

  return (
    <CreatorContext.Provider value={{ creator, loading, setCreatorSession, clearSession }}>
      {children}
    </CreatorContext.Provider>
  );
}

export function useCreator() {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error("useCreator must be used within a CreatorProvider");
  }
  return context;
}
