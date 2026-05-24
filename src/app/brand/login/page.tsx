"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBrand } from "@/context/BrandContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandLoginSchema, type BrandLoginValues } from "@/lib/validators/brand";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle, CheckCircle } from "lucide-react";

function BrandLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setBrandSession } = useBrand();
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BrandLoginValues>({
    resolver: zodResolver(brandLoginSchema),
  });

  useEffect(() => {
    const code = searchParams.get("code");
    const company = searchParams.get("company");
    if (code) setValue("accessCode", code);
    if (company) setValue("companyName", company);
  }, [searchParams, setValue]);

  const onSubmit = async (values: BrandLoginValues) => {
    setError(null);
    try {
      const res = await fetch("/api/brand/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Authentication failed");
        return;
      }

      setBrandSession(data.data);
      setShowWelcome(data.data.companyName);

      // Brief welcome animation then redirect
      setTimeout(() => {
        router.push("/brand/campaign");
        router.refresh();
      }, 1500);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">
            Welcome, {showWelcome} ✓
          </h1>
          <p className="text-white/35">Redirecting to your campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="font-display font-extrabold text-3xl text-white">
              Firstframe
            </h1>
            <p className="text-sm text-white/35 mt-2">
              Enter your access code to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/35 mb-2">
                Company Name
              </label>
              <input
                {...register("companyName")}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-colors"
                placeholder="Your company name"
              />
              {errors.companyName && (
                <p className="mt-1.5 text-xs text-[#FF6B5B]">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/35 mb-2">
                Access Code
              </label>
              <input
                {...register("accessCode")}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono tracking-widest uppercase placeholder:text-white/45 placeholder:font-sans placeholder:tracking-normal placeholder:normal-case focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-colors"
                placeholder="Enter your code"
              />
              {errors.accessCode && (
                <p className="mt-1.5 text-xs text-[#FF6B5B]">{errors.accessCode.message}</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[rgba(255,107,91,0.06)] border border-[rgba(255,107,91,0.12)]">
                <AlertCircle className="w-4 h-4 text-[#FF6B5B] flex-shrink-0" />
                <p className="text-sm text-[#FF6B5B]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="#FFFFFF" />
                  Verifying...
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

export default function BrandLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><LoadingSpinner size="lg" color="#FFFFFF" /></div>}>
      <BrandLoginForm />
    </Suspense>
  );
}
