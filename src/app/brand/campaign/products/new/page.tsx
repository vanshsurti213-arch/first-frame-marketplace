"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBrand } from "@/context/BrandContext";
import { createClient } from "@/lib/supabase/client";
import { FullPageLoader, LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import type { CampaignCreator } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Check, Package, Users } from "lucide-react";

interface VariantInput {
  id: string;
  label: string;
}

export default function NewProductPage() {
  const { brand, loading: brandLoading } = useBrand();
  const router = useRouter();
  const supabase = createClient();

  const [campaignCreators, setCampaignCreators] = useState<CampaignCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [variants, setVariants] = useState<VariantInput[]>([
    { id: Math.random().toString(36).substr(2, 9), label: "" }
  ]);
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);

  // Fetch accepted/invited creators in the campaign
  useEffect(() => {
    if (brandLoading) return;
    if (!brand?.campaignId) {
      router.push("/brand/campaign");
      return;
    }

    const fetchCampaignCreators = async () => {
      try {
        const { data, error } = await supabase
          .from("campaign_creators")
          .select("*")
          .eq("campaign_id", brand.campaignId)
          .neq("status", "rejected");
        
        if (error) throw error;
        setCampaignCreators(data || []);
      } catch (err) {
        console.error("[BRAND NEW PRODUCT FETCH ERROR]", err);
        toast.error("Failed to load campaign creators");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignCreators();
  }, [brand, brandLoading, supabase, router]);

  // Variant Helpers
  const addVariant = () => {
    setVariants((prev) => [...prev, { id: Math.random().toString(36).substr(2, 9), label: "" }]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 1) {
      toast.error("At least one product variant is required");
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVariantChange = (id: string, value: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, label: value } : v))
    );
  };

  // Creator Selection Helpers
  const toggleCreator = (creatorId: string) => {
    setSelectedCreatorIds((prev) =>
      prev.includes(creatorId)
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!productUrl.trim()) {
      toast.error("Product URL is required");
      return;
    }
    try {
      new URL(productUrl);
    } catch {
      toast.error("Please enter a valid product URL");
      return;
    }

    const filteredVariants = variants.map(v => ({ ...v, label: v.label.trim() })).filter(v => v.label.length > 0);
    if (filteredVariants.length === 0) {
      toast.error("At least one product variant label is required");
      return;
    }

    if (selectedCreatorIds.length === 0) {
      toast.error("Please assign at least one creator");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/brand/campaign/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          product_url: productUrl.trim(),
          variants: filteredVariants,
          assigned_creator_ids: selectedCreatorIds
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create product");
      }

      toast.success("Product created successfully!");
      router.push("/brand/campaign");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong while creating the product");
      setIsSubmitting(false);
    }
  };

  if (brandLoading || loading) return <FullPageLoader message="Loading campaign details..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <button 
        onClick={() => router.push("/brand/campaign")}
        className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-6 min-h-[44px] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Campaign
      </button>

      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Add New Product</h1>
        <p className="text-sm text-white/40 mt-1">Configure product variants and assign creators</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Product Info */}
        <div className="glass-card space-y-4">
          <h2 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-white/40" /> Product Details
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Desh Mechanical Keyboard"
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
              Product Link (URL)
            </label>
            <input
              type="url"
              required
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://yourbrand.com/products/keyboard"
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Product Variants */}
        <div className="glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-white/40" /> Product Variants
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs text-white/60 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-white/[0.08]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Variant
            </button>
          </div>
          <p className="text-xs text-white/30">Specify sizes, colors, layouts, or editions creators can choose from.</p>

          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={v.id} className="flex items-center gap-2 animate-scale-in">
                <span className="text-xs font-mono text-white/30 min-w-[1.5rem]">#{i + 1}</span>
                <input
                  type="text"
                  required
                  value={v.label}
                  onChange={(e) => handleVariantChange(v.id, e.target.value)}
                  placeholder="e.g. Cherry Red Switches (Slate Gray)"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(v.id)}
                  className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-red-500/10 text-white/40 hover:text-red-400 border border-white/[0.08] transition-colors"
                  title="Remove variant"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Assignments */}
        <div className="glass-card space-y-4">
          <h2 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-white/40" /> Assign Creators
          </h2>
          <p className="text-xs text-white/30">Select the creators in this campaign who will receive this product brief and shipping invitation.</p>

          {campaignCreators.length === 0 ? (
            <div className="py-4 text-center border border-dashed border-white/[0.08] rounded-xl bg-white/[0.01]">
              <p className="text-xs text-white/30">No active creators in this campaign yet.</p>
              <button 
                type="button"
                onClick={() => router.push("/brand/creators")}
                className="mt-2 text-xs text-[#2DD4A1] hover:underline"
              >
                Go invite creators to campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {campaignCreators.map((cc) => {
                const isSelected = selectedCreatorIds.includes(cc.creator_id);
                return (
                  <div
                    key={cc.id}
                    onClick={() => toggleCreator(cc.creator_id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      isSelected
                        ? "bg-white/[0.04] border-white text-white"
                        : "bg-white/[0.01] border-white/[0.08] text-white/60 hover:border-white/[0.15]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-xs font-bold text-white uppercase">
                        {cc.creator_name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold truncate max-w-[150px]">{cc.creator_name}</p>
                        <p className="text-[10px] text-white/30 capitalize">{cc.status}</p>
                      </div>
                    </div>
                    <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                      isSelected ? "bg-white border-white text-black" : "border-white/[0.2] bg-transparent"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || campaignCreators.length === 0}
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" color="#050505" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          Create Product & Brief
        </button>
      </form>
    </div>
  );
}
