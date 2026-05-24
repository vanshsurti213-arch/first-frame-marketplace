"use client";

import React, { useState } from "react";
import { createClient, type SupabaseClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [email, setEmail] = useState("admin@firstframe.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Only initialize Supabase on the client side
  React.useEffect(() => {
    const client = createClient();
    setSupabase(client);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables in .env.local");
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setLoading(true);
    setStatus("Authenticating...");

    try {
      // Enforce 15s timeout on network request
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<any>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new DOMException("Aborted", "AbortError"));
        }, 15000);
      });

      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error: authError } = await Promise.race([
        signInPromise,
        timeoutPromise,
      ]);

      if (timeoutId) clearTimeout(timeoutId);

      if (authError) {
        setError(authError.message);
        setLoading(false);
        setStatus("");
        return;
      }

      if (data.user) {
        setStatus("Verifying admin access...");
        const { data: adminData } = await supabase
          .from("admins")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!adminData) {
          await supabase.auth.signOut();
          setError("Not authorized. This account is not registered as an admin.");
          setLoading(false);
          setStatus("");
          return;
        }

        setStatus("Redirecting to dashboard...");
        window.location.href = "/admin/dashboard";
        return; // don't reset loading — page is navigating
      }
    } catch (err) {
      console.error("[v0] Login error:", err);
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Connection timed out. Check your internet and try again.");
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-16 items-center">
        {/* Left — Branding */}
        <div className="hidden md:block">
          <h1 className="font-display font-extrabold text-5xl text-white leading-tight tracking-tight">
            Firstframe
          </h1>
          <p className="mt-4 text-lg text-white/40 leading-relaxed">
            The operating layer for UGC campaigns.
          </p>
          <div className="mt-8 flex gap-3">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse-dot" />
            <div className="w-2 h-2 rounded-full bg-white animate-pulse-dot" style={{ animationDelay: "200ms" }} />
            <div className="w-2 h-2 rounded-full bg-white animate-pulse-dot" style={{ animationDelay: "400ms" }} />
          </div>
        </div>

        {/* Right — Login Card */}
        <div className="glass-card p-8 animate-fade-in">
          {/* Mobile branding */}
          <div className="md:hidden mb-8 text-center">
            <h1 className="font-display font-extrabold text-3xl text-white">
              Firstframe
            </h1>
            <p className="mt-2 text-sm text-white/40">
              The operating layer for UGC campaigns.
            </p>
          </div>

          <h2 className="font-display font-bold text-xl text-white mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-white/40 mb-8">
            Sign in to the admin dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-colors"
                placeholder="admin@firstframe.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[rgba(255,107,91,0.08)] border border-[rgba(255,107,91,0.15)]">
                <AlertCircle className="w-4 h-4 text-[#FF6B5B] flex-shrink-0" />
                <p className="text-sm text-[#FF6B5B]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-lime w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="#050505" />
                  {status || "Signing in..."}
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
