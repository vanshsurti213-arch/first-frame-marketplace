// ============================================================
// Firstframe V2 — TypeScript Type Definitions (Supabase)
// ============================================================

// All timestamps are ISO strings from PostgreSQL TIMESTAMPTZ

// ---- Database Row Types ----

export interface Admin {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Brand {
  id: string;
  company_name: string;
  email: string;
  campaign_id: string | null;
  brand_size: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Creator {
  id: string;
  name: string;
  niche: string;
  city: string;
  email: string;
  phone: string;               // ADMIN ONLY — never expose to brand/creator portal
  instagram_handle: string;    // ADMIN ONLY — never expose to brand/creator portal
  best_video_url: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  default_address: string | null;
  created_at: string;
  updated_at: string;
}

/** Sanitized creator for brand-facing views — no phone, instagram_handle */
export interface CreatorPublic {
  id: string;
  name: string;           // first name only for brand portal
  niche: string;
  city: string;
  best_video_url: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
}

export type CampaignStatus = "active" | "completed" | "archived";

export interface Campaign {
  id: string;
  brand_id: string | null;
  brand_name: string;
  name: string;
  status: CampaignStatus;
  collab_type: string | null;
  ad_rights_duration: string | null;
  brand_size: string | null;
  creator_kind: string | null;
  created_at: string;
  updated_at: string;
}

export type CampaignCreatorStatus =
  | "invited"
  | "negotiating"
  | "accepted"
  | "rejected"
  | "preference_pending"
  | "preference_submitted"
  | "product_dispatched"
  | "brief_received"
  | "content_submitted"
  | "content_under_review"
  | "revision_requested"
  | "content_approved"
  | "completed";

export interface CampaignCreator {
  id: string;
  campaign_id: string;
  creator_id: string;
  creator_name: string;
  status: CampaignCreatorStatus;
  agreed_rate: number | null;
  brand_rate: number | null;
  invited_at: string;
  accepted_at: string | null;
  notes: string | null;           // admin-only, never shown to brand or creator
  tracking_link: string | null;
  shipping_address: string | null;
  revision_count: number;
  last_updated: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  label: string;
}

export type ProductStatus = "draft" | "active" | "dispatched" | "completed";

export interface Product {
  id: string;
  campaign_id: string;
  name: string;
  variants: ProductVariant[];
  assigned_creator_ids: string[];
  script_content: string | null;
  script_version: number;
  script_updated_at: string | null;
  status: ProductStatus;
  product_url: string | null;
  brief_url: string | null;
  sop_url: string | null;
  tracking_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatorPreference {
  id: string;
  campaign_id: string;
  creator_id: string;
  creator_name: string;
  product_id: string;
  selected_variant_id: string;
  selected_variant_label: string;
  submitted_at: string;
}

export type ContentSubmissionStatus =
  | "submitted"
  | "under_review"
  | "revision_requested"
  | "approved";

export interface ContentSubmission {
  id: string;
  campaign_id: string;
  creator_id: string;
  creator_name: string;
  product_id: string;
  product_name: string;
  drive_link: string;
  status: ContentSubmissionStatus;
  revision_feedback: string | null;
  revision_count: number;
  submitted_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  reviewed_count: number;
}

export interface AccessCode {
  id: string;
  code: string;
  brand_email: string;
  brand_company_name: string;
  is_used: boolean;
  used_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  creator_link: string | null;
}

export type ActorType = "admin" | "brand" | "creator";

export interface ActivityLogEntry {
  id: string;
  campaign_id: string;
  actor_type: ActorType;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
}

export interface CreatorToken {
  id: string;
  creator_id: string;
  token: string;
  created_at: string;
  used_at: string | null;
}

// ---- Session Types ----

export interface AdminSession {
  id: string;
  uid: string;
  email: string;
  name: string;
}

export interface BrandSession {
  brandId: string;
  companyName: string;
  campaignId: string;
}

export interface CreatorSession {
  creatorId: string;
  creatorName: string;
}

// ---- API Types ----

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ---- Dashboard Metric Types ----

export interface DashboardMetrics {
  activeCampaigns: number;
  pendingInvites: number;
  awaitingReview: number;
  totalCreators: number;
}

export interface BrandDashboardMetrics {
  invitedCreators: number;
  acceptedCreators: number;
  products: number;
  pendingReviews: number;
}
