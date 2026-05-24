"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBrand } from "@/context/BrandContext";
import { CreatorCard } from "@/components/shared/CreatorCard";
import { VideoModal } from "@/components/shared/VideoModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonGrid } from "@/components/shared/SkeletonGrid";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { getFirstName } from "@/lib/utils";
import { NICHE_OPTIONS } from "@/lib/constants";
import type { CreatorPublic, CampaignCreator } from "@/types";
import { toast } from "sonner";
import { Users, Search } from "lucide-react";
import { motion } from "framer-motion";
import { getCreatorsAction, getCampaignCreatorsAction } from "./actions";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function BrandCreatorsPage() {
  const { brand, loading: brandLoading } = useBrand();
  const supabase = createClient();

  const [creators, setCreators] = useState<CreatorPublic[]>([]);
  const [campaignCreators, setCampaignCreators] = useState<CampaignCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{ url: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nicheFilter, setNicheFilter] = useState("All");
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Fetch creators using Server Action to bypass RLS securely
    const creatorsData = await getCreatorsAction();
    // Sanitize names for brand view
    const sanitized = (creatorsData || []).map((c) => ({
      ...c,
      name: getFirstName(c.name) + " " + (c.name.split(" ")[1]?.charAt(0) || "") + ".",
    }));
    setCreators(sanitized as CreatorPublic[]);

    if (brand?.campaignId) {
      const ccData = await getCampaignCreatorsAction(brand.campaignId);
      setCampaignCreators(ccData || []);
    }
    setLoading(false);
  }, [supabase, brand]);

  useEffect(() => {
    if (!brandLoading && brand) fetchData();
  }, [brand, brandLoading, fetchData]);

  const inviteCreator = async (creatorId: string, creatorName: string) => {
    if (!brand?.campaignId) return;
    setInvitingId(creatorId);
    try {
      const { error } = await supabase.from("campaign_creators").insert({
        campaign_id: brand.campaignId,
        creator_id: creatorId,
        creator_name: creatorName,
        status: "invited",
      });
      if (error) throw error;
      toast.success("Creator invited to campaign");
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to invite creator";
      toast.error(message);
    } finally {
      setInvitingId(null);
    }
  };

  if (brandLoading) return <FullPageLoader />;

  const filtered = creators.filter((c) => {
    const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNiche = nicheFilter === "All" || c.niche === nicheFilter;
    return matchesSearch && matchesNiche;
  });

  const getCreatorStatus = (creatorId: string) => {
    const cc = campaignCreators.find((c) => c.creator_id === creatorId);
    if (!cc) return null;
    if (cc.status === "invited") return "invited";
    if (cc.status === "rejected") return "rejected";
    return "in_campaign";
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Browse Creators</h1>
        <p className="text-sm text-white/35 mt-1">Find and invite creators for your campaign</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
          <input
            type="text" placeholder="Search by name or city..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", ...NICHE_OPTIONS].map((niche) => (
            <button key={niche} onClick={() => setNicheFilter(niche)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${nicheFilter === niche ? "bg-white text-black" : "bg-white/[0.04] text-white/35 hover:bg-white/[0.08]"}`}>
              {niche}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonGrid count={8} variant="light" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users className="w-7 h-7 text-white/45" />} title="No creators found" description="Try adjusting your search or filters." />
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filtered.map((creator) => {
            const status = getCreatorStatus(creator.id);
            return (
              <motion.div key={creator.id} className="relative" variants={itemVariants}>
                <CreatorCard
                  id={creator.id}
                  name={creator.name}
                  niche={creator.niche}
                  city={creator.city}
                  thumbnailUrl={creator.thumbnail_url}
                  videoUrl={creator.best_video_url}
                  showAdminTag={false}
                  inCampaign={status === "in_campaign"}
                  onVideoClick={() => {
                    if (creator.best_video_url) {
                      setVideoModal({ url: creator.best_video_url, name: creator.name });
                    }
                  }}
                />
                {/* Invite button */}
                <div className="mt-2">
                  {status === "in_campaign" ? (
                    <div className="w-full py-2 text-center text-xs font-semibold text-[#2DD4A1] bg-[rgba(45,212,161,0.08)] rounded-xl">
                      In Campaign ✓
                    </div>
                  ) : status === "invited" ? (
                    <div className="w-full py-2 text-center text-xs font-semibold text-white bg-white/[0.08] rounded-xl">
                      Invited ✓
                    </div>
                  ) : (
                    <button
                      onClick={() => inviteCreator(creator.id, creator.name)}
                      disabled={invitingId === creator.id}
                      className="w-full py-2 text-center text-xs font-semibold text-black bg-white rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      {invitingId === creator.id ? "Inviting..." : "Invite to Campaign"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {videoModal && (
        <VideoModal isOpen={true} onClose={() => setVideoModal(null)} videoUrl={videoModal.url} creatorName={videoModal.name} />
      )}
    </div>
  );
}
