"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { ACTIVITY_LOG_PAGE_SIZE } from "@/lib/constants";
import type { ActivityLogEntry, Campaign, ActorType } from "@/types";
import { ScrollText } from "lucide-react";

export default function AdminLogPage() {
  const { admin, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCampaign, setFilterCampaign] = useState<string>("all");
  const [filterActorType, setFilterActorType] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!authLoading && admin) {
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }).then(({ data }) => setCampaigns(data || []));
    }
  }, [admin, authLoading, supabase]);

  useEffect(() => {
    if (!authLoading && admin) {
      setLoading(true);
      let query = supabase.from("activity_log").select("*").order("timestamp", { ascending: false }).range(page * ACTIVITY_LOG_PAGE_SIZE, (page + 1) * ACTIVITY_LOG_PAGE_SIZE - 1);
      if (filterCampaign !== "all") query = query.eq("campaign_id", filterCampaign);
      if (filterActorType !== "all") query = query.eq("actor_type", filterActorType);
      query.then(({ data }) => {
        setEntries(data || []);
        setHasMore((data || []).length === ACTIVITY_LOG_PAGE_SIZE);
        setLoading(false);
      });
    }
  }, [admin, authLoading, supabase, filterCampaign, filterActorType, page]);

  if (authLoading) return <FullPageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-[#F2F2F3]">Activity Log</h1>
        <p className="text-sm text-[#8A8A9A] mt-1">All platform activity across campaigns</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={filterCampaign}
          onChange={(e) => { setFilterCampaign(e.target.value); setPage(0); }}
          className="px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] text-sm text-[#F2F2F3] focus:outline-none focus:border-[#CAFF4C] transition-colors"
        >
          <option value="all">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {["all", "admin", "brand", "creator"].map((type) => (
            <button
              key={type}
              onClick={() => { setFilterActorType(type); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                filterActorType === type
                  ? "bg-[#CAFF4C] text-[#0C0C0F]"
                  : "bg-[rgba(255,255,255,0.04)] text-[#8A8A9A] hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Log */}
      {loading ? (
        <SkeletonTable rows={10} cols={4} />
      ) : entries.length === 0 ? (
        <EmptyState icon={<ScrollText className="w-7 h-7 text-[#4A4A5A]" />} title="No activity recorded" description="Activity will appear here as actions are taken across the platform." />
      ) : (
        <>
          <div className="glass-card p-0 overflow-hidden">
            <ActivityFeed entries={entries} />
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-ghost text-xs disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-[#4A4A5A]">Page {page + 1}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="btn-ghost text-xs disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
