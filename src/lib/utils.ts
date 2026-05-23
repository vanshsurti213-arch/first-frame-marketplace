// ============================================================
// Firstframe V1 — Utility Functions (Supabase)
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution (required by shadcn/ui) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format ISO timestamp string to readable date */
export function formatDate(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return "—";
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format ISO timestamp to readable date + time */
export function formatDateTime(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return "—";
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format relative time (e.g. "2 hours ago") */
export function formatRelativeTime(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return "—";
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return "—";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
}

/** Get first name only (for brand-facing creator views) */
export function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

/** Generate a random access code (8 chars, alphanumeric uppercase) */
export function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** Mask an access code for display */
export function maskAccessCode(code: string): string {
  if (code.length <= 4) return "****";
  return `${code.slice(0, 2)}${"•".repeat(code.length - 4)}${code.slice(-2)}`;
}

/** Validate Google Drive link */
export function isValidDriveLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "drive.google.com" || parsed.hostname === "docs.google.com";
  } catch {
    return false;
  }
}

/** Format currency (INR) */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}


/** Remove PII from creator object before returning to brand/creator */
export function sanitizeCreator(creator: any) {
  if (!creator) return creator;
  const { phone, instagram_handle, ...safe } = creator;
  return safe;
}
