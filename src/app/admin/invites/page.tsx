"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { CampaignCreator } from "@/types";
import { toast } from "sonner";
import { Inbox, CheckCircle, XCircle } from "lucide-react";

export default function AdminInvitesPage() {
  const { admin, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [invites, setInvites] = useState<(CampaignCreator & { campaign_name?: string; brand_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [rateInputs, setRateInputs] = useState<Record<string, { agreed: string; brand: string }>>({});

  const fetchInvites = useCallback(async () => {
    const { data } = await supabase
      .from("campaign_creators")
      .select("*, campaigns(name, brand_name)")
      .eq("status", "invited")
      .order("invited_at", { ascending: true });
    if (data) {
      setInvites(
        data.map((d: Record<string, unknown>) => ({
          ...d,
          campaign_name: (d.campaigns as Record<string, string>)?.name,
          brand_name: (d.campaigns as Record<string, string>)?.brand_name,
        })) as (CampaignCreator & { campaign_name?: string; brand_name?: string })[]
      );
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!authLoading && admin) fetchInvites();
  }, [admin, authLoading, fetchInvites]);

  const approve = async (cc: CampaignCreator) => {
    const rates = rateInputs[cc.id];
    const { error } = await supabase
      .from("campaign_creators")
      .update({
        status: "accepted",
        agreed_rate: rates ? parseFloat(rates.agreed) || 0 : 0,
        brand_rate: rates ? parseFloat(rates.brand) || 0 : 0,
        accepted_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      })
      .eq("id", cc.id);
    if (error) { toast.error("Failed to approve"); return; }
    toast.success(`Approved ${cc.creator_name}`);
    fetchInvites();
  };

  const reject = async (cc: CampaignCreator) => {
    const { error } = await supabase
      .from("campaign_creators")
      .update({ status: "rejected", last_updated: new Date().toISOString() })
      .eq("id", cc.id);
    if (error) { toast.error("Failed to reject"); return; }
    toast.success(`Rejected ${cc.creator_name}`);
    fetchInvites();
  };

  if (authLoading) return <FullPageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Invite Queue</h1>
        <p className="text-sm text-white/40 mt-1">{invites.length} pending invite{invites.length !== 1 ? "s" : ""} across all campaigns</p>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : invites.length === 0 ? (
        <EmptyState icon={<Inbox className="w-7 h-7 text-white/25" />} title="No pending invites" description="All creator invites have been processed." />
      ) : (
        <div className="glass-card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Campaign</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Brand</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Creator</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Invited</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Agreed Rate</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Brand Rate</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv.id} className="table-row-hover border-b border-white/[0.04]">
                  <td className="px-5 py-4 text-sm font-medium text-white">{inv.campaign_name || "—"}</td>
                  <td className="px-5 py-4 text-sm text-white/40">{inv.brand_name || "—"}</td>
                  <td className="px-5 py-4 text-sm text-white">{inv.creator_name}</td>
                  <td className="px-5 py-4 text-sm text-white/40">{formatDate(inv.invited_at)}</td>
                  <td className="px-5 py-4">
                    <input type="number" placeholder="₹0" className="w-20 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30"
                      value={rateInputs[inv.id]?.agreed || ""}
                      onChange={(e) => setRateInputs((p) => ({ ...p, [inv.id]: { ...p[inv.id], agreed: e.target.value } }))}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <input type="number" placeholder="₹0" className="w-20 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-white/30"
                      value={rateInputs[inv.id]?.brand || ""}
                      onChange={(e) => setRateInputs((p) => ({ ...p, [inv.id]: { ...p[inv.id], brand: e.target.value } }))}
                    />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => approve(inv)} className="p-1.5 rounded-lg bg-[rgba(45,212,161,0.1)] hover:bg-[rgba(45,212,161,0.2)] transition-colors"><CheckCircle className="w-4 h-4 text-[#2DD4A1]" /></button>
                      <button onClick={() => reject(inv)} className="p-1.5 rounded-lg bg-[rgba(255,107,91,0.1)] hover:bg-[rgba(255,107,91,0.2)] transition-colors"><XCircle className="w-4 h-4 text-[#FF6B5B]" /></button>
                    </div>
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
