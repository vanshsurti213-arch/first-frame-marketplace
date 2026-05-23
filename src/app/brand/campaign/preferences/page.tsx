"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBrand } from "@/context/BrandContext";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { exportToCsv } from "@/lib/csv";
import type { Product, CreatorPreference } from "@/types";
import { ClipboardList, Download } from "lucide-react";

export default function BrandPreferencesPage() {
  const { brand, loading: brandLoading } = useBrand();
  const supabase = createClient();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [preferences, setPreferences] = useState<CreatorPreference[]>([]);
  const [activeProductId, setActiveProductId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brandLoading) return;
    if (!brand?.campaignId) {
      router.push("/brand/campaign");
      return;
    }
    Promise.all([
      supabase.from("products").select("*").eq("campaign_id", brand.campaignId),
      supabase.from("creator_preferences").select("*").eq("campaign_id", brand.campaignId).order("submitted_at", { ascending: false }),
    ]).then(([prodRes, prefRes]) => {
      setProducts(prodRes.data || []);
      setPreferences(prefRes.data || []);
      if (prodRes.data && prodRes.data.length > 0) setActiveProductId(prodRes.data[0].id);
      setLoading(false);
    });
  }, [brand, brandLoading, supabase, router]);

  const filteredPrefs = preferences.filter((p) => p.product_id === activeProductId);

  const handleExport = () => {
    if (filteredPrefs.length === 0) return;
    const rows = filteredPrefs.map((p) => ({
      "Creator Name": p.creator_name,
      "Variant Selected": p.selected_variant_label,
      "Submitted At": formatDate(p.submitted_at),
    }));
    exportToCsv(rows, `preferences-${activeProductId}`);
  };

  if (brandLoading || loading) return <FullPageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#111116]">Preferences</h1>
          <p className="text-sm text-[#5A5A6E] mt-1">View creator product preferences</p>
        </div>
        {filteredPrefs.length > 0 && (
          <button onClick={handleExport} className="btn-lime text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Product tabs */}
      {products.length > 0 && (
        <div className="flex gap-1 mb-6 border-b border-[rgba(0,0,0,0.05)] overflow-x-auto">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProductId(p.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeProductId === p.id
                  ? "text-[#111116] border-[#CAFF4C]"
                  : "text-[#9A9AAA] border-transparent hover:text-[#5A5A6E]"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {filteredPrefs.length === 0 ? (
        <EmptyState variant="light" icon={<ClipboardList className="w-7 h-7 text-[#9A9AAA]" />} title="No preferences yet" description="Creator preferences will appear here." />
      ) : (
        <div className="glass-card-light overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.05)]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Creator</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Variant</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrefs.map((pref) => (
                <tr key={pref.id} className="table-row-hover-light border-b border-[rgba(0,0,0,0.04)]">
                  <td className="px-5 py-4 text-sm font-medium text-[#111116]">{pref.creator_name.split(" ")[0]}</td>
                  <td className="px-5 py-4 text-sm text-[#5A5A6E]">{pref.selected_variant_label}</td>
                  <td className="px-5 py-4 text-sm text-[#5A5A6E]">{formatDate(pref.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
