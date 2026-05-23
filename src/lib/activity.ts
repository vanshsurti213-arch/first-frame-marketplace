// ============================================================
// Firstframe V2 — Activity Log Utility (Fire-and-Forget)
// ============================================================

import { createServiceRoleClient } from "./supabase/server";

interface LogParams {
  campaignId: string;
  actorType: "admin" | "brand" | "creator";
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
}

/**
 * Insert an activity log entry. Fire-and-forget — never throws.
 * Safe to call without `await` when you don't need confirmation.
 */
export async function logActivity(params: LogParams): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("activity_log").insert({
      campaign_id: params.campaignId,
      actor_type: params.actorType,
      actor_id: params.actorId,
      actor_name: params.actorName,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
    });
  } catch (err) {
    console.error("[ACTIVITY LOG ERROR]", err);
    // Fire and forget — never throw
  }
}
