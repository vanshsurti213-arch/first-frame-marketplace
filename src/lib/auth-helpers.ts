// ============================================================
// Firstframe V2 — Auth Validation Helpers
// ============================================================

import { NextRequest } from "next/server";
import { createServerSupabase, createServiceRoleClient } from "./supabase/server";
import type { BrandSession, CreatorSession } from "@/types";

// ---- Cookie names ----
const BRAND_COOKIE = "firstframe_brand_session";
const CREATOR_COOKIE = "firstframe_creator_session";

// ---- Admin session (Supabase Auth + admins table) ----

/**
 * Validate the current admin session via Supabase Auth cookies.
 * Checks the auth.users session, then verifies the user exists in the `admins` table.
 * Returns `{ id, email, name }` or `null`.
 */
export async function validateAdminSession(): Promise<{
  id: string;
  email: string;
  name: string;
} | null> {
  try {
    const serverSupabase = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await serverSupabase.auth.getUser();

    if (authError || !user) return null;

    const supabase = createServiceRoleClient();
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id, email, name")
      .eq("id", user.id)
      .single();

    if (adminError || !admin) return null;

    return { id: admin.id, email: admin.email, name: admin.name };
  } catch {
    return null;
  }
}

// ---- Brand session (custom cookie) ----

/**
 * Validate a brand session from the `firstframe_brand_session` cookie.
 * The cookie value is a base64-encoded JSON payload: `{ brandId, companyName, campaignId }`.
 * Verifies the brand exists in the DB before returning.
 */
export async function validateBrandSession(
  req: NextRequest
): Promise<BrandSession | null> {
  try {
    const raw = req.cookies.get(BRAND_COOKIE)?.value;
    if (!raw) return null;

    const decoded = JSON.parse(
      Buffer.from(raw, "base64").toString("utf-8")
    ) as Partial<BrandSession>;

    if (!decoded.brandId || !decoded.companyName || !decoded.campaignId) {
      return null;
    }

    const supabase = createServiceRoleClient();
    const { data: brand, error } = await supabase
      .from("brands")
      .select("id")
      .eq("id", decoded.brandId)
      .single();

    if (error || !brand) return null;

    return {
      brandId: decoded.brandId,
      companyName: decoded.companyName,
      campaignId: decoded.campaignId,
    };
  } catch {
    return null;
  }
}

// ---- Creator session (custom cookie) ----

/**
 * Validate a creator session from the `firstframe_creator_session` cookie.
 * The cookie value is a base64-encoded JSON payload: `{ creatorId, creatorName }`.
 * Verifies the creator exists in the DB before returning.
 */
export async function validateCreatorSession(
  req: NextRequest
): Promise<CreatorSession | null> {
  try {
    const raw = req.cookies.get(CREATOR_COOKIE)?.value;
    if (!raw) return null;

    const decoded = JSON.parse(
      Buffer.from(raw, "base64").toString("utf-8")
    ) as Partial<CreatorSession>;

    if (!decoded.creatorId || !decoded.creatorName) {
      return null;
    }

    const supabase = createServiceRoleClient();
    const { data: creator, error } = await supabase
      .from("creators")
      .select("id")
      .eq("id", decoded.creatorId)
      .single();

    if (error || !creator) return null;

    return {
      creatorId: decoded.creatorId,
      creatorName: decoded.creatorName,
    };
  } catch {
    return null;
  }
}
