"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { exportToCsv } from "@/lib/csv";
import type { Campaign, Product, CreatorPreference } from "@/types";
import { ClipboardList, Download } from "lucide-react";

export default function AdminPreferencesPage() {
  const { admin, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [preferences, setPreferences] = useState<CreatorPreference[]>([]);
  const [activeProductId, setActiveProductId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && admin) {
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }).then(({ data }) => {
        setCampaigns(data || []);
        if (data && data.length > 0) setSelectedCampaign(data[0].id);
        setLoading(false);
      });
    }
  }, [admin, authLoading, supabase]);

  useEffect(() => {
    if (!selectedCampaign) return;
    Promise.all([
      supabase.from("products").select("*").eq("campaign_id", selectedCampaign),
      supabase.from("creator_preferences").select("*").eq("campaign_id", selectedCampaign).order("submitted_at", { ascending: false }),
    ]).then(([prodRes, prefRes]) => {
      setProducts(prodRes.data || []);
      setPreferences(prefRes.data || []);
      if (prodRes.data && prodRes.data.length > 0) setActiveProductId(prodRes.data[0].id);
    });
  }, [selectedCampaign, supabase]);

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

  if (authLoading) return <FullPageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#F2F2F3]">Preferences Export</h1>
          <p className="text-sm text-[#8A8A9A] mt-1">View and export creator product preferences</p>
        </div>
        {filteredPrefs.length > 0 && (
          <button onClick={handleExport} className="btn-lime text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Campaign selector */}
      <div className="mb-6">
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] text-sm text-[#F2F2F3] focus:outline-none focus:border-[#CAFF4C] transition-colors"
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.brand_name}</option>
          ))}
        </select>
      </div>

      {/* Product tabs */}
      {products.length > 0 && (
        <div className="flex gap-1 mb-6 border-b border-[rgba(255,255,255,0.07)] overflow-x-auto">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProductId(p.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeProductId === p.id
                  ? "text-[#CAFF4C] border-[#CAFF4C]"
                  : "text-[#8A8A9A] border-transparent hover:text-[#F2F2F3]"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Preferences table */}
      {loading ? (
        <SkeletonTable rows={5} cols={3} />
      ) : filteredPrefs.length === 0 ? (
        <EmptyState icon={<ClipboardList className="w-7 h-7 text-[#4A4A5A]" />} title="No preferences submitted yet" description="Creator preferences will appear here once they select their product variants." />
      ) : (
        <div className="glass-card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Creator</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Variant Selected</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrefs.map((pref) => (
                <tr key={pref.id} className="table-row-hover border-b border-[rgba(255,255,255,0.05)]">
                  <td className="px-5 py-4 text-sm font-medium text-[#F2F2F3]">{pref.creator_name}</td>
                  <td className="px-5 py-4 text-sm text-[#8A8A9A]">{pref.selected_variant_label}</td>
                  <td className="px-5 py-4 text-sm text-[#8A8A9A]">{formatDate(pref.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
