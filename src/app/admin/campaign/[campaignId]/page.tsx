"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { FullPageLoader, LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { MAX_REVISIONS } from "@/lib/constants";
import type { Campaign, CampaignCreator, Product, ContentSubmission, ActivityLogEntry } from "@/types";
import { toast } from "sonner";
import {
  Users, Package, FileVideo, Activity, ExternalLink, CheckCircle, XCircle,
  Truck, Plus, ChevronDown, ChevronRight, MessageSquare,
} from "lucide-react";

type Tab = "creators" | "products" | "submissions" | "activity";

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { admin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>("creators");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [campaignCreators, setCampaignCreators] = useState<CampaignCreator[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState<Record<Tab, boolean>>({ creators: false, products: false, submissions: false, activity: false });
  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set(["creators"]));

  // Inline edit states
  const [rateInputs, setRateInputs] = useState<Record<string, { agreed: string; brand: string }>>({});
  const [revisionFeedback, setRevisionFeedback] = useState<Record<string, string>>({});
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Fetch only campaign on initial load (fast)
  useEffect(() => {
    if (!campaignId || authLoading || !admin) return;
    
    const fetchCampaign = async () => {
      try {
        const { data } = await supabase.from("campaigns").select("*").eq("id", campaignId).single();
        if (data) setCampaign(data);
      } catch (err) {
        console.error("[v0] Campaign fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [campaignId, authLoading, admin, supabase]);

  // Fetch tab data on demand (lazy loading)
  const fetchTabData = useCallback(async (tab: Tab) => {
    if (loadedTabs.has(tab)) return; // Already loaded
    
    setTabLoading((prev) => ({ ...prev, [tab]: true }));
    try {
      if (tab === "creators") {
        const { data } = await supabase
          .from("campaign_creators")
          .select("*")
          .eq("campaign_id", campaignId)
          .order("invited_at", { ascending: false });
        setCampaignCreators(data || []);
      } else if (tab === "products") {
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("campaign_id", campaignId)
          .order("created_at", { ascending: false });
        setProducts(data || []);
      } else if (tab === "submissions") {
        const { data } = await supabase
          .from("content_submissions")
          .select("*")
          .eq("campaign_id", campaignId)
          .order("submitted_at", { ascending: false });
        setSubmissions(data || []);
      } else if (tab === "activity") {
        const { data } = await supabase
          .from("activity_log")
          .select("*")
          .eq("campaign_id", campaignId)
          .order("timestamp", { ascending: false })
          .limit(50);
        setActivityLog(data || []);
      }
      setLoadedTabs((prev) => new Set([...prev, tab]));
    } catch (err) {
      console.error(`[v0] Tab data fetch error for ${tab}:`, err);
    } finally {
      setTabLoading((prev) => ({ ...prev, [tab]: false }));
    }
  }, [campaignId, loadedTabs, supabase]);

  // Load creators tab data initially
  useEffect(() => {
    if (!loading && campaign && !loadedTabs.has("creators")) {
      fetchTabData("creators");
    }
  }, [loading, campaign, loadedTabs, fetchTabData]);

  // Fetch tab data when tab changes
  useEffect(() => {
    if (!loading && campaign) {
      fetchTabData(activeTab);
    }
  }, [activeTab, loading, campaign, fetchTabData]);

  const refreshCurrentTab = useCallback(async () => {
    setLoadedTabs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(activeTab);
      return newSet;
    });
    await fetchTabData(activeTab);
  }, [activeTab, fetchTabData]);

  const approveInvite = async (cc: CampaignCreator) => {
    const rates = rateInputs[cc.id];
    const agreedRate = rates ? parseFloat(rates.agreed) : 0;
    const brandRate = rates ? parseFloat(rates.brand) : 0;
    const { error } = await supabase
      .from("campaign_creators")
      .update({
        status: "accepted",
        agreed_rate: agreedRate,
        brand_rate: brandRate,
        accepted_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      })
      .eq("id", cc.id);
    if (error) { toast.error("Failed to approve"); return; }
    toast.success(`Approved ${cc.creator_name}`);
    refreshCurrentTab();
  };

  const rejectInvite = async (cc: CampaignCreator) => {
    const { error } = await supabase
      .from("campaign_creators")
      .update({ status: "rejected", last_updated: new Date().toISOString() })
      .eq("id", cc.id);
    if (error) { toast.error("Failed to reject"); return; }
    toast.success(`Rejected ${cc.creator_name}`);
    refreshCurrentTab();
  };

  const approveSubmission = async (sub: ContentSubmission) => {
    const { error } = await supabase
      .from("content_submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
    if (error) { toast.error("Failed to approve submission"); return; }
    toast.success("Submission approved");
    refreshCurrentTab();
  };

  const requestRevision = async (sub: ContentSubmission) => {
    const feedback = revisionFeedback[sub.id];
    if (!feedback || feedback.trim().length < 10) {
      toast.error("Please provide detailed feedback (at least 10 characters)");
      return;
    }
    const { error } = await supabase
      .from("content_submissions")
      .update({
        status: "revision_requested",
        revision_feedback: feedback,
        revision_count: sub.revision_count + 1,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
    if (error) { toast.error("Failed to request revision"); return; }
    toast.success("Revision requested");
    setRevisionFeedback((prev) => ({ ...prev, [sub.id]: "" }));
    refreshCurrentTab();
  };

  if (authLoading || loading) return <FullPageLoader message="Loading campaign..." />;
  if (!campaign) return <EmptyState title="Campaign not found" description="This campaign doesn't exist." />;

  const TABS: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "creators", label: "Creators", icon: <Users className="w-4 h-4" />, count: campaignCreators.length },
    { key: "products", label: "Products", icon: <Package className="w-4 h-4" />, count: products.length },
    { key: "submissions", label: "Submissions", icon: <FileVideo className="w-4 h-4" />, count: submissions.length },
    { key: "activity", label: "Activity Log", icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display font-bold text-2xl text-white">
            {campaign.name}
          </h1>
          <StatusPill status={campaign.status} type="product" label={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)} />
        </div>
        <div className="flex items-center gap-4 text-sm text-white/40">
          <span>{campaign.brand_name}</span>
          {campaign.collab_type && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/[0.08] text-white">
              {campaign.collab_type}
            </span>
          )}
          <span>Created {formatDate(campaign.created_at)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/[0.08] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? "text-white border-white"
                : "text-white/40 border-transparent hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-white/[0.15] text-white" : "bg-white/[0.04] text-white/20"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "creators" && (
        <div>
          {campaignCreators.length === 0 ? (
            <EmptyState icon={<Users className="w-7 h-7 text-[#4A4A5A]" />} title="No creators in this campaign" description="Invite creators from the Creator Pool." />
          ) : (
            <div className="glass-card overflow-hidden p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.07)]">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Creator</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Invited</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Agreed Rate</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Brand Rate</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignCreators.map((cc) => (
                    <tr key={cc.id} className="table-row-hover border-b border-[rgba(255,255,255,0.05)]">
                      <td className="px-5 py-4 text-sm font-medium text-white">{cc.creator_name}</td>
                      <td className="px-5 py-4"><StatusPill status={cc.status} /></td>
                      <td className="px-5 py-4 text-sm text-white/40">{formatDate(cc.invited_at)}</td>
                      <td className="px-5 py-4 text-sm text-white/40">
                        {cc.status === "invited" ? (
                          <input
                            type="number"
                            placeholder="₹0"
                            className="w-20 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30"
                            value={rateInputs[cc.id]?.agreed || ""}
                            onChange={(e) => setRateInputs((prev) => ({ ...prev, [cc.id]: { ...prev[cc.id], agreed: e.target.value } }))}
                          />
                        ) : (
                          cc.agreed_rate ? formatCurrency(cc.agreed_rate) : "—"
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-white/40">
                        {cc.status === "invited" ? (
                          <input
                            type="number"
                            placeholder="₹0"
                            className="w-20 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30"
                            value={rateInputs[cc.id]?.brand || ""}
                            onChange={(e) => setRateInputs((prev) => ({ ...prev, [cc.id]: { ...prev[cc.id], brand: e.target.value } }))}
                          />
                        ) : (
                          cc.brand_rate ? formatCurrency(cc.brand_rate) : "—"
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {cc.status === "invited" && (
                            <>
                              <button onClick={() => approveInvite(cc)} className="p-1.5 rounded-lg bg-[rgba(45,212,161,0.1)] hover:bg-[rgba(45,212,161,0.2)] transition-colors" title="Approve">
                                <CheckCircle className="w-4 h-4 text-[#2DD4A1]" />
                              </button>
                              <button onClick={() => rejectInvite(cc)} className="p-1.5 rounded-lg bg-[rgba(255,107,91,0.1)] hover:bg-[rgba(255,107,91,0.2)] transition-colors" title="Reject">
                                <XCircle className="w-4 h-4 text-[#FF6B5B]" />
                              </button>
                            </>
                          )}
                          {cc.status === "accepted" && (
                            <button className="text-xs text-[#5BAAFF] hover:text-[#89C4FF] flex items-center gap-1 transition-colors" title="Mark Dispatched">
                              <Truck className="w-3 h-3" /> Dispatch
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "products" && (
        <div>
          {products.length === 0 ? (
            <EmptyState icon={<Package className="w-7 h-7 text-[#4A4A5A]" />} title="No products yet" description="Add a product to this campaign." />
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="glass-card p-0 overflow-hidden">
                  <button
                    onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#F2F2F3]">{product.name}</span>
                      <StatusPill status={product.status} type="product" />
                      <span className="text-xs text-[#4A4A5A]">{product.variants?.length || 0} variants</span>
                    </div>
                    {expandedProduct === product.id ? <ChevronDown className="w-4 h-4 text-[#4A4A5A]" /> : <ChevronRight className="w-4 h-4 text-[#4A4A5A]" />}
                  </button>
                  {expandedProduct === product.id && (
                    <div className="px-5 pb-5 border-t border-[rgba(255,255,255,0.05)] animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9A] mb-2">Variants</h4>
                          <div className="space-y-1">
                            {product.variants?.map((v) => (
                              <div key={v.id} className="text-sm text-[#F2F2F3] px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)]">
                                {v.label}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A8A9A] mb-2">Script</h4>
                          <div className="text-sm text-[#8A8A9A] bg-[rgba(255,255,255,0.02)] p-3 rounded-lg max-h-40 overflow-y-auto">
                            {product.script_content || <span className="italic text-[#4A4A5A]">No script uploaded yet</span>}
                          </div>
                          <p className="text-xs text-[#4A4A5A] mt-1">v{product.script_version}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {product.brief_url && (
                          <a href={product.brief_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#5BAAFF] hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Brief
                          </a>
                        )}
                        {product.sop_url && (
                          <a href={product.sop_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#5BAAFF] hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> SOP
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "submissions" && (
        <div>
          {submissions.length === 0 ? (
            <EmptyState icon={<FileVideo className="w-7 h-7 text-[#4A4A5A]" />} title="No submissions yet" description="Content submissions will appear here once creators submit their videos." />
          ) : (
            <div className="glass-card overflow-hidden p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.07)]">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Creator</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Product</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Submitted</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Drive Link</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Rev</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4A5A]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <React.Fragment key={sub.id}>
                      <tr className="table-row-hover border-b border-[rgba(255,255,255,0.05)]">
                        <td className="px-5 py-4 text-sm font-medium text-[#F2F2F3]">{sub.creator_name}</td>
                        <td className="px-5 py-4 text-sm text-[#8A8A9A]">{sub.product_name}</td>
                        <td className="px-5 py-4 text-sm text-[#8A8A9A]">{formatDate(sub.submitted_at)}</td>
                        <td className="px-5 py-4">
                          <a href={sub.drive_link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#5BAAFF] hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Open
                          </a>
                        </td>
                        <td className="px-5 py-4"><StatusPill status={sub.status} type="content_submission" /></td>
                        <td className="px-5 py-4 text-sm text-[#8A8A9A]">{sub.revision_count} of {MAX_REVISIONS}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            {(sub.status === "submitted" || sub.status === "under_review") && (
                              <>
                                <button onClick={() => approveSubmission(sub)} className="p-1.5 rounded-lg bg-[rgba(45,212,161,0.1)] hover:bg-[rgba(45,212,161,0.2)] transition-colors" title="Approve">
                                  <CheckCircle className="w-4 h-4 text-[#2DD4A1]" />
                                </button>
                                {sub.revision_count < MAX_REVISIONS && (
                                  <button
                                    onClick={() => setRevisionFeedback((prev) => ({ ...prev, [sub.id]: prev[sub.id] ?? "" }))}
                                    className="p-1.5 rounded-lg bg-[rgba(255,181,71,0.1)] hover:bg-[rgba(255,181,71,0.2)] transition-colors"
                                    title="Request Revision"
                                  >
                                    <MessageSquare className="w-4 h-4 text-[#FFB547]" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {revisionFeedback[sub.id] !== undefined && (
                        <tr className="border-b border-[rgba(255,255,255,0.05)]">
                          <td colSpan={7} className="px-5 py-3">
                            <div className="flex gap-2 animate-fade-in">
                              <textarea
                                value={revisionFeedback[sub.id]}
                                onChange={(e) => setRevisionFeedback((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                                placeholder="What needs to change?"
                                rows={2}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-orange-500/40 resize-none"
                              />
                              <button onClick={() => requestRevision(sub)} className="btn-primary text-xs h-fit self-end">Send</button>
                              <button onClick={() => setRevisionFeedback((prev) => { const n = { ...prev }; delete n[sub.id]; return n; })} className="text-xs text-white/40 hover:text-white h-fit self-end">Cancel</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="glass-card p-0 overflow-hidden">
          <ActivityFeed entries={activityLog} />
        </div>
      )}
    </div>
  );
}
