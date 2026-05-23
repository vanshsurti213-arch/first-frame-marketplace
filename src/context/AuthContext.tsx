"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient, type SupabaseClient } from "@/lib/supabase/client";
import type { AdminSession } from "@/types";

interface AuthContextType {
  admin: AdminSession | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialize Supabase client on mount
  useEffect(() => {
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    if (!supabase) {
      console.warn("[v0] Supabase not configured - skipping auth check");
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Verify user is in admins table
          const { data: adminData } = await supabase
            .from("admins")
            .select("id, email, name")
            .eq("id", user.id)
            .single();

          if (adminData) {
            setAdmin({
              id: adminData.id,
              uid: adminData.id,
              email: adminData.email,
              name: adminData.name,
            });
          } else {
            // User exists in auth but not in admins table
            await supabase.auth.signOut();
            setAdmin(null);
          }
        } else {
          setAdmin(null);
        }
      } catch (error) {
        console.warn("[v0] Auth check error:", error);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const { data: adminData } = await supabase
            .from("admins")
            .select("id, email, name")
            .eq("id", session.user.id)
            .single();

          if (adminData) {
            setAdmin({
              id: adminData.id,
              uid: adminData.id,
              email: adminData.email,
              name: adminData.name,
            });
          }
        } else if (event === "SIGNED_OUT") {
          setAdmin(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn("[v0] Sign out error:", error);
      }
    }
    setAdmin(null);
    router.push("/admin/login");
  }, [supabase, router]);

  return (
    <AuthContext.Provider value={{ admin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
