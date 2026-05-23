"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreator } from "@/context/CreatorContext";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusPill } from "@/components/shared/StatusPill";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import type { Campaign, CampaignCreator } from "@/types";
import { ArrowRight, Inbox } from "lucide-react";

// Step-based progress for creator
const STATUS_STEPS: Record<string, number> = {
  invited: 0, accepted: 1, preference_pending: 1, preference_submitted: 2,
  product_dispatched: 2, brief_received: 3, content_submitted: 4,
  content_under_review: 4, revision_requested: 4, content_approved: 5, completed: 5,
};

const SMART_MESSAGES: Record<string, string> = {
  invited: "We're reviewing your invite",
  accepted: "You've been accepted! Check for products.",
  preference_pending: "Products need your input",
  preference_submitted: "Waiting for your product to ship",
  product_dispatched: "Your product is on its way!",
  brief_received: "Brief ready — check it out",
  content_submitted: "Submitted — we'll review soon",
  content_under_review: "Your submission is being reviewed",
  revision_requested: "Revision needed — see feedback",
  content_approved: "Approved ✓ Great work!",
  completed: "Campaign completed!",
};

export default function CreatorDashboardPage() {
  const { creator, loading: creatorLoading } = useCreator();
  const supabase = createClient();
  const router = useRouter();

  const [campaignData, setCampaignData] = useState<{ campaign: Campaign; cc: CampaignCreator }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (creatorLoading || !creator?.creatorId) return;
    const fetchData = async () => {
      const { data: ccData } = await supabase
        .from("campaign_creators")
        .select("*, campaigns(*)")
        .eq("creator_id", creator.creatorId)
        .neq("status", "rejected");

      if (ccData) {
        const mapped = ccData.map((cc: Record<string, unknown>) => ({
          campaign: cc.campaigns as unknown as Campaign,
          cc: cc as unknown as CampaignCreator,
        }));
        setCampaignData(mapped);
      }
      setLoading(false);
    };
    fetchData();
  }, [creator, creatorLoading, supabase]);

  if (creatorLoading || loading) return <FullPageLoader message="Loading your dashboard..." />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-[#111116]">
          Hi {creator?.creatorName?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-[#5A5A6E] mt-1">
          Here&apos;s what&apos;s happening with your campaigns
        </p>
      </div>

      {/* Campaign cards */}
      {campaignData.length === 0 ? (
        <EmptyState
          variant="light"
          icon={<Inbox className="w-7 h-7 text-[#9A9AAA]" />}
          title="No campaigns yet"
          description="You haven't been added to any campaigns yet. Check back soon!"
        />
      ) : (
        <div className="space-y-4">
          {campaignData.map(({ campaign, cc }) => {
            const step = STATUS_STEPS[cc.status] ?? 0;
            const totalSteps = 5;
            const message = SMART_MESSAGES[cc.status] || cc.status;

            return (
              <div
                key={cc.id}
                className="glass-card-light p-5 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/creator/campaign/${campaign.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#111116]">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-[#5A5A6E] mt-1">{message}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#9A9AAA] flex-shrink-0 mt-1" />
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-colors"
                        style={{
                          background: i < step ? "#CAFF4C" : i === step ? "rgba(202,255,76,0.4)" : "rgba(0,0,0,0.06)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#9A9AAA] mt-1.5">Step {step} of {totalSteps}</p>
                </div>

                <div className="mt-3">
                  <button
                    className="btn-lime-pill text-sm w-full md:w-auto"
                    onClick={(e) => { e.stopPropagation(); router.push(`/creator/campaign/${campaign.id}`); }}
                  >
                    Go to Campaign
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
