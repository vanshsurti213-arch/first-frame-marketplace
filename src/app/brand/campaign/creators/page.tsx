"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBrand } from "@/context/BrandContext";
import { createClient } from "@/lib/supabase/client";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { BRAND_FACING_STATUS } from "@/lib/constants";
import type { CampaignCreator } from "@/types";
import { Users } from "lucide-react";

export default function BrandCampaignCreatorsPage() {
  const { brand, loading: brandLoading } = useBrand();
  const supabase = createClient();
  const router = useRouter();
  const [creators, setCreators] = useState<CampaignCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brandLoading) return;
    if (!brand?.campaignId) {
      router.push("/brand/campaign");
      return;
    }
    supabase.from("campaign_creators").select("*").eq("campaign_id", brand.campaignId).order("invited_at", { ascending: false }).then(({ data }) => {
      setCreators(data || []);
      setLoading(false);
    });
  }, [brand, brandLoading, supabase, router]);

  if (brandLoading || loading) return <FullPageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-[#111116]">Campaign Roster</h1>
        <p className="text-sm text-[#5A5A6E] mt-1">{creators.length} creator{creators.length !== 1 ? "s" : ""} in this campaign</p>
      </div>
      {creators.length === 0 ? (
        <EmptyState variant="light" icon={<Users className="w-7 h-7 text-[#9A9AAA]" />} title="No creators yet" description="Invite creators from the Browse page." />
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
              {creators.map((cc) => (
                <tr key={cc.id} className="table-row-hover-light border-b border-[rgba(0,0,0,0.04)]">
                  <td className="px-5 py-4 text-sm font-medium text-[#111116]">{cc.creator_name.split(" ")[0]}</td>
                  <td className="px-5 py-4"><StatusPill status={cc.status} label={BRAND_FACING_STATUS[cc.status] || cc.status} /></td>
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
