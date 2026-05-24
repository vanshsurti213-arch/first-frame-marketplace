// ============================================================
// Firstframe V2 — Constants
// ============================================================

import { CampaignCreatorStatus, ContentSubmissionStatus, ProductStatus } from "@/types";

// ---- V2 Status Colors (per design spec) ----

export const CAMPAIGN_CREATOR_STATUS_CONFIG: Record<
  CampaignCreatorStatus,
  { label: string; dotColor: string; bgColor: string }
> = {
  invited: {
    label: "Invited",
    dotColor: "#5BAAFF",
    bgColor: "rgba(91, 170, 255, 0.1)",
  },
  negotiating: {
    label: "Negotiating",
    dotColor: "#FFB547",
    bgColor: "rgba(255, 181, 71, 0.1)",
  },
  accepted: {
    label: "Accepted",
    dotColor: "#2DD4A1",
    bgColor: "rgba(45, 212, 161, 0.1)",
  },
  rejected: {
    label: "Rejected",
    dotColor: "#FF6B5B",
    bgColor: "rgba(255, 107, 91, 0.1)",
  },
  preference_pending: {
    label: "Awaiting Product Selection",
    dotColor: "#FFB547",
    bgColor: "rgba(255, 181, 71, 0.1)",
  },
  preference_submitted: {
    label: "Product Selected",
    dotColor: "#A78BFA",
    bgColor: "rgba(167, 139, 250, 0.1)",
  },
  product_dispatched: {
    label: "Product Dispatched",
    dotColor: "#60A5FA",
    bgColor: "rgba(96, 165, 250, 0.1)",
  },
  brief_received: {
    label: "Brief Received",
    dotColor: "#F472B6",
    bgColor: "rgba(244, 114, 182, 0.1)",
  },
  content_submitted: {
    label: "Content Submitted",
    dotColor: "#FFB547",
    bgColor: "rgba(255, 181, 71, 0.1)",
  },
  content_under_review: {
    label: "Under Review",
    dotColor: "#FB923C",
    bgColor: "rgba(251, 146, 60, 0.1)",
  },
  revision_requested: {
    label: "Revision Requested",
    dotColor: "#FF6B5B",
    bgColor: "rgba(255, 107, 91, 0.1)",
  },
  content_approved: {
    label: "Content Approved",
    dotColor: "#2DD4A1",
    bgColor: "rgba(45, 212, 161, 0.1)",
  },
  completed: {
    label: "Completed",
    dotColor: "#4ADE80",
    bgColor: "rgba(74, 222, 128, 0.1)",
  },
};

export const CONTENT_SUBMISSION_STATUS_CONFIG: Record<
  ContentSubmissionStatus,
  { label: string; dotColor: string; bgColor: string }
> = {
  submitted: {
    label: "Submitted",
    dotColor: "#5BAAFF",
    bgColor: "rgba(91, 170, 255, 0.1)",
  },
  under_review: {
    label: "Under Review",
    dotColor: "#FB923C",
    bgColor: "rgba(251, 146, 60, 0.1)",
  },
  revision_requested: {
    label: "Revision Requested",
    dotColor: "#FF6B5B",
    bgColor: "rgba(255, 107, 91, 0.1)",
  },
  approved: {
    label: "Approved",
    dotColor: "#2DD4A1",
    bgColor: "rgba(45, 212, 161, 0.1)",
  },
};

export const PRODUCT_STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; dotColor: string; bgColor: string }
> = {
  draft: {
    label: "Draft",
    dotColor: "#8A8A9A",
    bgColor: "rgba(138, 138, 154, 0.1)",
  },
  active: {
    label: "Active",
    dotColor: "#2DD4A1",
    bgColor: "rgba(45, 212, 161, 0.1)",
  },
  dispatched: {
    label: "Dispatched",
    dotColor: "#60A5FA",
    bgColor: "rgba(96, 165, 250, 0.1)",
  },
  completed: {
    label: "Completed",
    dotColor: "#4ADE80",
    bgColor: "rgba(74, 222, 128, 0.1)",
  },
};

// ---- Brand-facing status labels (hide internal process) ----

export const BRAND_FACING_STATUS: Partial<Record<CampaignCreatorStatus, string>> = {
  invited: "Under Review",
  negotiating: "Under Review",
  accepted: "Active",
  preference_pending: "Awaiting Product Selection",
  preference_submitted: "Product Selected",
  product_dispatched: "Product Dispatched",
  brief_received: "Brief Sent",
  content_submitted: "Content Submitted",
  content_under_review: "Under Review",
  revision_requested: "Revision Requested",
  content_approved: "Approved",
  completed: "Completed",
};

// ---- Creator Niche Options ----

export const NICHE_OPTIONS = [
  "Beauty",
  "Lifestyle",
  "Tech",
  "Fashion",
  "Food",
  "Fitness",
] as const;

export type NicheOption = (typeof NICHE_OPTIONS)[number];

// ---- Collab Type Options ----

export const COLLAB_TYPE_OPTIONS = [
  "Barter",
  "Paid",
  "Barter + Paid",
] as const;

// ---- Creator Kind Options ----

export const CREATOR_KIND_OPTIONS = [
  "Nano",
  "Micro",
  "Macro",
] as const;

// ---- Brand Size Options ----

export const BRAND_SIZE_OPTIONS = [
  "Startup",
  "SME",
  "Enterprise",
] as const;

// ---- Max Revisions ----

export const MAX_REVISIONS = 2;

// ---- Pagination ----

export const ACTIVITY_LOG_PAGE_SIZE = 20;
