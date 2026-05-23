"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBrand } from "@/context/BrandContext";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { BRAND_FACING_STATUS } from "@/lib/constants";
import type { Campaign, CampaignCreator, Product, ContentSubmission, BrandDashboardMetrics } from "@/types";
import { Users, Package, Eye, UserPlus, ArrowRight, FileVideo } from "lucide-react";
import { toast } from "sonner";

export default function BrandCampaignPage() {
  const { brand, loading: brandLoading, setBrandSession, clearSession } = useBrand();
  const router = useRouter();
  const supabase = createClient();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [creators, setCreators] = useState<CampaignCreator[]>([]);
  const [metrics, setMetrics] = useState<BrandDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);

  const handleRefresh = async () => {
    if (!brand?.brandId) return;
    try {
      const { data } = await supabase
        .from("brands")
        .select("campaign_id, company_name")
        .eq("id", brand.brandId)
        .maybeSingle();

      if (data?.campaign_id) {
        setBrandSession({
          brandId: brand.brandId,
          companyName: data.company_name || brand.companyName,
          campaignId: data.campaign_id,
        });
        toast.success("Campaign synced successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        toast.info("Campaign is still being set up. Try logging out and back in to force-provision.");
      }
    } catch {
      toast.error("Failed to check campaign status.");
    }
  };

  useEffect(() => {
    if (brandLoading) return;
    if (!brand?.campaignId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [campRes, ccRes, prodRes, subRes] = await Promise.all([
          supabase.from("campaigns").select("*").eq("id", brand.campaignId).single(),
          supabase.from("campaign_creators").select("*").eq("campaign_id", brand.campaignId).order("invited_at", { ascending: false }),
          supabase.from("products").select("*", { count: "exact", head: true }).eq("campaign_id", brand.campaignId),
          supabase.from("content_submissions").select("*").eq("campaign_id", brand.campaignId).in("status", ["submitted", "under_review"]),
        ]);

        setCampaign(campRes.data);
        setCreators(ccRes.data || []);
        const invitedCount = (ccRes.data || []).filter((c) => c.status === "invited").length;
        const acceptedCount = (ccRes.data || []).filter((c) => !["invited", "rejected"].includes(c.status)).length;
        setMetrics({
          invitedCreators: invitedCount,
          acceptedCreators: acceptedCount,
          products: prodRes.count || 0,
          pendingReviews: (subRes.data || []).length,
        });
        setPendingReviewCount((subRes.data || []).length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [brand, brandLoading, supabase]);

  if (brandLoading) return <FullPageLoader message="Loading your campaign..." />;

  if (!brand?.campaignId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="glass-card-light p-8">
            <div className="w-16 h-16 rounded-full bg-[rgba(255,181,71,0.08)] flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-[#FFB547]" />
            </div>
            <h1 className="font-display font-bold text-2xl text-[#111116] mb-3">
              Campaign Setup Pending
            </h1>
            <p className="text-sm text-[#5A5A6E] mb-6 leading-relaxed">
              Hi <strong className="text-[#111116]">{brand?.companyName || "there"}</strong>! We are currently configuring your brand campaign dashboard. 
              Please log out and sign back in to apply the configuration, or click below to refresh the status.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleRefresh}
                className="w-full py-3 rounded-xl bg-[#111116] text-white text-sm font-semibold hover:bg-[#1A1A1F] transition-colors"
              >
                Refresh Status
              </button>
              <button 
                onClick={clearSession}
                className="w-full py-3 rounded-xl bg-transparent border border-[rgba(0,0,0,0.1)] text-[#5A5A6E] text-sm font-semibold hover:bg-[rgba(0,0,0,0.02)] transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <FullPageLoader message="Loading your campaign..." />;

  const METRIC_CARDS = [
    { label: "Invited", value: metrics?.invitedCreators ?? 0, icon: <UserPlus className="w-5 h-5 text-[#5BAAFF]" /> },
    { label: "Accepted", value: metrics?.acceptedCreators ?? 0, icon: <Users className="w-5 h-5 text-[#2DD4A1]" /> },
    { label: "Products", value: metrics?.products ?? 0, icon: <Package className="w-5 h-5 text-[#A78BFA]" /> },
    { label: "Pending Reviews", value: metrics?.pendingReviews ?? 0, icon: <Eye className="w-5 h-5 text-[#FFB547]" /> },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-[#111116]">
          {brand?.companyName}&apos;s Campaign
        </h1>
        <div className="flex items-center gap-3 mt-2">
          {campaign?.collab_type && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(202,255,76,0.15)] text-[#6B8F1E]">
              {campaign.collab_type}
            </span>
          )}
          {campaign && <StatusPill status={campaign.status} type="product" label={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)} />}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {METRIC_CARDS.map((card) => (
          <div key={card.label} className="glass-card-light p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">{card.label}</span>
              {card.icon}
            </div>
            <div className="font-display font-bold text-3xl text-[#111116]">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <button onClick={() => router.push("/brand/creators")} className="btn-lime text-sm">
          <Users className="w-4 h-4" /> Browse Creators
        </button>
        <button onClick={() => router.push("/brand/campaign/products/new")} className="btn-ghost-light text-sm">
          <Package className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Pending reviews callout */}
      {pendingReviewCount > 0 && (
        <div
          onClick={() => router.push("/brand/campaign/submissions")}
          className="glass-card-light p-5 mb-8 cursor-pointer border-l-4 border-l-[#FFB547] hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <FileVideo className="w-5 h-5 text-[#FFB547]" />
            <div>
              <p className="text-sm font-semibold text-[#111116]">{pendingReviewCount} video{pendingReviewCount !== 1 ? "s" : ""} awaiting your review</p>
              <p className="text-xs text-[#5A5A6E]">Click to review submissions</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#9A9AAA] ml-auto" />
          </div>
        </div>
      )}

      {/* Creator roster preview */}
      <div className="mb-4">
        <h2 className="font-display font-bold text-lg text-[#111116] mb-4">Recent Creators</h2>
      </div>
      {creators.length === 0 ? (
        <EmptyState variant="light" icon={<Users className="w-7 h-7 text-[#9A9AAA]" />} title="No creators yet" description="Start by browsing and inviting creators to your campaign." />
      ) : (
        <div className="glass-card-light overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.05)]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Creator</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Since</th>
              </tr>
            </thead>
            <tbody>
              {creators.slice(0, 5).map((cc) => (
                <tr key={cc.id} className="table-row-hover-light border-b border-[rgba(0,0,0,0.04)]">
                  <td className="px-5 py-4 text-sm font-medium text-[#111116]">{cc.creator_name.split(" ")[0]}</td>
                  <td className="px-5 py-4">
                    <StatusPill
                      status={cc.status}
                      label={BRAND_FACING_STATUS[cc.status] || cc.status}
                    />
                  </td>
                  <td className="px-5 py-4 text-sm text-[#5A5A6E]">{formatDate(cc.invited_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
