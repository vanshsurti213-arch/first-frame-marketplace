// ============================================================
// Firstframe V2 — Client-Side Session Utilities
// ============================================================
//
// These run in the browser (client components). They read the
// brand/creator session cookies from document.cookie and provide
// typed fetch wrappers.

"use client";

import type { BrandSession, CreatorSession } from "@/types";

// ---- Cookie names ----
const BRAND_COOKIE = "firstframe_brand_session";
const CREATOR_COOKIE = "firstframe_creator_session";

// ---- Cookie parser ----

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

// ---- Session readers ----

/**
 * Read the brand session cookie from the browser.
 * Returns `BrandSession` or `null` if not present / invalid.
 */
export function getBrandSession(): BrandSession | null {
  try {
    const raw = getCookie(BRAND_COOKIE);
    if (!raw) return null;
    const decoded = JSON.parse(atob(raw)) as Partial<BrandSession>;
    if (!decoded.brandId || !decoded.companyName || !decoded.campaignId) {
      return null;
    }
    return decoded as BrandSession;
  } catch {
    return null;
  }
}

/**
 * Read the creator session cookie from the browser.
 * Returns `CreatorSession` or `null` if not present / invalid.
 */
export function getCreatorSession(): CreatorSession | null {
  try {
    const raw = getCookie(CREATOR_COOKIE);
    if (!raw) return null;
    const decoded = JSON.parse(atob(raw)) as Partial<CreatorSession>;
    if (!decoded.creatorId || !decoded.creatorName) {
      return null;
    }
    return decoded as CreatorSession;
  } catch {
    return null;
  }
}

// ---- Authenticated fetch wrappers ----

/**
 * Fetch wrapper for brand portal API calls.
 * Reads the brand session cookie and attaches it as an `x-brand-session` header.
 */
export async function brandFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const raw = getCookie(BRAND_COOKIE);
  const headers = new Headers(options.headers);
  if (raw) {
    headers.set("x-brand-session", raw);
  }
  return fetch(url, { ...options, headers, credentials: "include" });
}

/**
 * Fetch wrapper for creator portal API calls.
 * Reads the creator session cookie and attaches it as an `x-creator-session` header.
 */
export async function creatorFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const raw = getCookie(CREATOR_COOKIE);
  const headers = new Headers(options.headers);
  if (raw) {
    headers.set("x-creator-session", raw);
  }
  return fetch(url, { ...options, headers, credentials: "include" });
}
