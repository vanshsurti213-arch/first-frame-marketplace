"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { Campaign, DashboardMetrics } from "@/types";
import {
  BarChart3,
  Users,
  Clock,
  Eye,
  ArrowRight,
  Layers,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { admin, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!admin) return;

    const fetchData = async () => {
      try {
        // Execute all queries concurrently to drastically speed up loading
        const [
          campaignsRes,
          activeCampaignsRes,
          pendingInvitesRes,
          awaitingReviewRes,
          totalCreatorsRes,
        ] = await Promise.all([
          supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
          supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("campaign_creators").select("*", { count: "exact", head: true }).eq("status", "invited"),
          supabase.from("content_submissions").select("*", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
          supabase.from("creators").select("*", { count: "exact", head: true }).eq("is_active", true),
        ]);

        setCampaigns(campaignsRes.data || []);
        setMetrics({
          activeCampaigns: activeCampaignsRes.count || 0,
          pendingInvites: pendingInvitesRes.count || 0,
          awaitingReview: awaitingReviewRes.count || 0,
          totalCreators: totalCreatorsRes.count || 0,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [admin, authLoading, supabase]);

  if (authLoading) return <FullPageLoader message="Loading..." />;

  const METRIC_CARDS = [
    {
      label: "Active Campaigns",
      value: metrics?.activeCampaigns ?? "—",
      icon: <BarChart3 className="w-5 h-5 text-white" />,
    },
    {
      label: "Pending Invites",
      value: metrics?.pendingInvites ?? "—",
      icon: <Clock className="w-5 h-5 text-[#FFB547]" />,
    },
    {
      label: "Awaiting Review",
      value: metrics?.awaitingReview ?? "—",
      icon: <Eye className="w-5 h-5 text-[#5BAAFF]" />,
    },
    {
      label: "Total Active Creators",
      value: metrics?.totalCreators ?? "—",
      icon: <Users className="w-5 h-5 text-[#2DD4A1]" />,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">
          Dashboard
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Welcome back, {admin?.name || "Admin"}
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {METRIC_CARDS.map((card) => (
          <div key={card.label} className="metric-card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {card.label}
              </span>
              {card.icon}
            </div>
            <div className="font-display font-bold text-3xl text-white">
              {loading ? (
                <div className="h-9 w-16 skeleton-shimmer rounded" />
              ) : (
                card.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns table */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-white">
          Campaigns
        </h2>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-7 h-7 text-white/25" />}
          title="No campaigns yet"
          description="Generate an access code to onboard your first brand."
          action={
            <button
              onClick={() => router.push("/admin/codes")}
              className="btn-lime text-sm"
            >
              Generate Access Code
            </button>
          }
        />
      ) : (
        <div className="glass-card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/25">
                  Campaign
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/25">
                  Brand
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/25">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/25">
                  Created
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/25">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="table-row-hover border-b border-white/[0.06] cursor-pointer"
                  onClick={() => router.push(`/admin/campaign/${campaign.id}`)}
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-white">
                      {campaign.name}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-white/40">
                      {campaign.brand_name}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill
                      status={campaign.status}
                      type="product"
                      label={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-white/40">
                      {formatDate(campaign.created_at)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ArrowRight className="w-4 h-4 text-white/25 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
