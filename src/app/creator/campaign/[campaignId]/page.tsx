"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCreator } from "@/context/CreatorContext";
import { createClient } from "@/lib/supabase/client";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import type { Campaign, CampaignCreator, Product, CreatorPreference } from "@/types";
import { toast } from "sonner";
import { ArrowRight, Package, MapPin, Check, Pencil } from "lucide-react";

export default function CreatorCampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { creator, loading: creatorLoading } = useCreator();
  const supabase = createClient();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [cc, setCc] = useState<CampaignCreator | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [preferences, setPreferences] = useState<CreatorPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (creatorLoading || !creator?.creatorId || !campaignId) return;
    const fetchData = async () => {
      const [campRes, ccRes, prodRes, prefRes] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", campaignId).single(),
        supabase.from("campaign_creators").select("*").eq("campaign_id", campaignId).eq("creator_id", creator.creatorId).single(),
        supabase.from("products").select("*").eq("campaign_id", campaignId).in("status", ["active", "draft"]).order("created_at", { ascending: false }),
        supabase.from("creator_preferences").select("*").eq("campaign_id", campaignId).eq("creator_id", creator.creatorId),
      ]);
      setCampaign(campRes.data);
      setCc(ccRes.data);
      setProducts(prodRes.data || []);
      setPreferences(prefRes.data || []);

      // Pre-fill address
      if (ccRes.data?.shipping_address) {
        setAddress(ccRes.data.shipping_address);
      } else {
        // Fetch default address
        const { data: creatorData } = await supabase.from("creators").select("default_address").eq("id", creator.creatorId).single();
        if (creatorData?.default_address) setAddress(creatorData.default_address);
      }

      setLoading(false);
    };
    fetchData();
  }, [creator, creatorLoading, campaignId, supabase]);

  const saveAddress = async () => {
    if (!cc || !address.trim()) { toast.error("Please enter your address"); return; }
    setSavingAddress(true);
    const { error } = await supabase.from("campaign_creators").update({ shipping_address: address, last_updated: new Date().toISOString() }).eq("id", cc.id);
    if (error) { toast.error("Failed to save address"); setSavingAddress(false); return; }
    toast.success("Address saved");
    setEditingAddress(false);
    setSavingAddress(false);
  };

  if (creatorLoading || loading) return <FullPageLoader message="Loading campaign details..." />;
  if (!campaign) return <EmptyState title="Campaign not found" />;

  const hasSubmittedPreference = (productId: string) => preferences.some((p) => p.product_id === productId);

  // Determine smart CTA per product
  const getProductCTA = (product: Product) => {
    const pref = preferences.find((p) => p.product_id === product.id);
    if (!pref) return { label: "Choose Your Product ↗", variant: "primary" as const, action: () => router.push(`/creator/campaign/${campaignId}/product/${product.id}`) };
    return { label: "View Details ↗", variant: "ghost" as const, action: () => router.push(`/creator/campaign/${campaignId}/product/${product.id}`) };
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-xl text-white">{campaign.name}</h1>
        <p className="text-sm text-white/40 mt-1">{campaign.brand_name}</p>
      </div>

      {/* Products */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-base text-white mb-3">Products</h2>
        {products.length === 0 ? (
          <EmptyState icon={<Package className="w-7 h-7 text-white/20" />} title="No products yet" description="Products will appear here once they're added to the campaign." />
        ) : (
          <div className="space-y-3">
            {products.map((product) => {
              const cta = getProductCTA(product);
              const hasPref = hasSubmittedPreference(product.id);
              return (
                <div key={product.id} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="text-xs text-white/40 mt-1">{product.variants?.length || 0} variant{(product.variants?.length || 0) !== 1 ? "s" : ""}</p>
                    </div>
                    {hasPref && (
                      <div className="flex items-center gap-1 text-xs text-[#2DD4A1]">
                        <Check className="w-3 h-3" /> Selected
                      </div>
                    )}
                  </div>
                  <button
                    onClick={cta.action}
                    className={cta.variant === "primary" ? "btn-primary text-sm w-full" : "btn-ghost text-sm w-full text-center justify-center"}
                  >
                    {cta.label}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shipping Address */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-base text-white mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-white/40" /> Shipping Address
        </h2>
        <div className="glass-card p-5">
          {cc?.shipping_address && !editingAddress ? (
            <div>
              <p className="text-sm text-white whitespace-pre-wrap">{cc.shipping_address}</p>
              <button onClick={() => setEditingAddress(true)} className="text-xs text-[#2DD4A1] mt-2 flex items-center gap-1">
                <Pencil className="w-3 h-3" /> Edit Address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full shipping address"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 resize-none"
                style={{ fontSize: "16px" }}
              />
              <button onClick={saveAddress} disabled={savingAddress} className="btn-primary text-sm w-full">
                {savingAddress ? "Saving..." : "Save Address"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
