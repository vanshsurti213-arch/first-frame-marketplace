"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { LoadingSpinner, FullPageLoader } from "@/components/shared/LoadingSpinner";
import { StatusPill } from "@/components/shared/StatusPill";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accessCodeFormSchema, type AccessCodeFormValues } from "@/lib/validators/admin";
import { generateAccessCode, maskAccessCode, formatDate } from "@/lib/utils";
import type { AccessCode } from "@/types";
import { toast } from "sonner";
import { Key, Copy, Check, X, Ban, Shield } from "lucide-react";

export default function AdminCodesPage() {
  const { admin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<{code: string, company: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccessCodeFormValues>({
    resolver: zodResolver(accessCodeFormSchema),
  });

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<any>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new DOMException("Aborted", "AbortError"));
        }, 15000);
      });

      const fetchPromise = fetch("/api/admin/codes");

      const res = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]);

      if (timeoutId) clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Failed to load access codes");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      setCodes(json.data.codes);
    } catch (err: unknown) {
      console.error("Error fetching access codes:", err);
      let message = "Failed to load access codes";
      if (err instanceof DOMException && err.name === "AbortError") {
        message = "Connection timed out. Please refresh.";
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!authLoading && admin) fetchCodes();
  }, [admin, authLoading, fetchCodes]);

  const onSubmit = async (values: AccessCodeFormValues) => {
    const toastId = toast.loading("Generating access code...");
    try {
      const code = generateAccessCode();

      // Enforce 15s timeout on network request
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<any>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new DOMException("Aborted", "AbortError"));
        }, 15000);
      });

      const insertPromise = fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_email: values.brand_email,
          brand_company_name: values.brand_company_name,
          ...(values.expires_at && { expires_at: values.expires_at }),
        }),
      });

      const res = await Promise.race([
        insertPromise,
        timeoutPromise,
      ]);

      if (timeoutId) clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Failed to generate code");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      setCodes((prev) => [json.data.accessCode, ...prev]);
      
      toast.success("Access code generated successfully!", { id: toastId });
      setGeneratedCode({ code: json.data.code, company: values.brand_company_name });
      reset();
    } catch (err: unknown) {
      console.error("Code generation error:", err);
      let message = "Failed to generate code";
      if (err instanceof DOMException && err.name === "AbortError") {
        message = "Connection timed out. Please try again.";
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message, { id: toastId });
    }
  };

  const revokeCode = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/codes/${id}/revoke`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to revoke code");
      }

      toast.success("Code revoked");
      const now = new Date().toISOString();
      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, expires_at: now } : c))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke code");
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = () => {
    if (generatedCode) {
      const url = new URL("/brand/login", window.location.origin);
      url.searchParams.set("code", generatedCode.code);
      url.searchParams.set("company", generatedCode.company);
      navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (authLoading) return <FullPageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-[#F2F2F3]">
          Access Codes
        </h1>
        <p className="text-sm text-[#8A8A9A] mt-1">
          Generate and manage brand access codes
        </p>
      </div>

      {/* Generator form */}
      <div className="glass-card p-6 mb-8">
        <h2 className="font-display font-bold text-lg text-white mb-4">
          Generate New Code
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
              Brand Email
            </label>
            <input
              {...register("brand_email")}
              type="email"
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="brand@company.com"
            />
            {errors.brand_email && <p className="mt-1 text-xs text-[#FF6B5B]">{errors.brand_email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
              Company Name
            </label>
            <input
              {...register("brand_company_name")}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="Desh Keyboard"
            />
            {errors.brand_company_name && <p className="mt-1 text-xs text-[#FF6B5B]">{errors.brand_company_name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
              Expiry Date <span className="text-white/20">(optional)</span>
            </label>
            <input
              {...register("expires_at")}
              type="date"
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" disabled={isSubmitting} className="btn-primary text-sm flex items-center gap-2">
              {isSubmitting ? <LoadingSpinner size="sm" color="#050505" /> : <Key className="w-4 h-4" />}
              Generate Code
            </button>
          </div>
        </form>
      </div>

      {/* Generated code modal */}
      {generatedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-8 max-w-md w-full mx-4 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.08] flex items-center justify-center mx-auto mb-5">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">
              Access Code Generated
            </h3>
            <p className="text-sm text-white/40 mb-6">
              This code will not be shown again. Copy it now or share the link directly.
            </p>
            <div className="flex items-center justify-center gap-3 mb-6">
              <code className="font-mono text-2xl font-bold text-white tracking-widest">
                {generatedCode.code}
              </code>
              <button
                onClick={copyCode}
                className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors"
                title="Copy Code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-[#2DD4A1]" />
                ) : (
                  <Copy className="w-5 h-5 text-white/40" />
                )}
              </button>
            </div>
            
            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={copyLink}
                className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                {copiedLink ? "Link Copied!" : "Copy Shareable Login Link"}
              </button>
            </div>

            <button
              onClick={() => setGeneratedCode(null)}
              className="btn-ghost text-sm w-full"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Codes table */}
      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : codes.length === 0 ? (
        <EmptyState
          icon={<Key className="w-7 h-7 text-[#4A4A5A]" />}
          title="No access codes yet"
          description="Generate your first access code to onboard a brand."
        />
      ) : (
        <div className="glass-card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Company</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Code</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Used</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Expires</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Created</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Action</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => {
                const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
                return (
                  <tr key={code.id} className="table-row-hover border-b border-[rgba(255,255,255,0.05)]">
                    <td className="px-5 py-4 text-sm font-medium text-[#F2F2F3]">{code.brand_company_name}</td>
                    <td className="px-5 py-4 text-sm text-[#8A8A9A]">{code.brand_email}</td>
                    <td className="px-5 py-4 font-mono text-sm text-[#8A8A9A]">{maskAccessCode(code.code)}</td>
                    <td className="px-5 py-4">
                      {code.is_used ? (
                        <span className="text-xs text-[#2DD4A1]">Yes — {formatDate(code.used_at)}</span>
                      ) : (
                        <span className="text-xs text-[#4A4A5A]">No</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#8A8A9A]">
                      {isExpired ? (
                        <span className="text-[#FF6B5B]">Expired</span>
                      ) : code.expires_at ? (
                        formatDate(code.expires_at)
                      ) : (
                        <span className="text-[#4A4A5A]">Never</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#8A8A9A]">{formatDate(code.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      {!isExpired && (
                        <button
                          onClick={() => revokeCode(code.id)}
                          className="text-xs text-[#FF6B5B] hover:text-[#FF4747] transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Ban className="w-3 h-3" />
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
