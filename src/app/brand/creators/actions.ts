"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export async function getCreatorsAction() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("creators")
    .select("id, name, niche, city, best_video_url, thumbnail_url, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  
  return data || [];
}

export async function getCampaignCreatorsAction(campaignId: string) {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("campaign_creators")
    .select("*")
    .eq("campaign_id", campaignId);
  return data || [];
}
