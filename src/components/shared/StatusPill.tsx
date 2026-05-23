"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  CAMPAIGN_CREATOR_STATUS_CONFIG,
  CONTENT_SUBMISSION_STATUS_CONFIG,
  PRODUCT_STATUS_CONFIG,
} from "@/lib/constants";
import type {
  CampaignCreatorStatus,
  ContentSubmissionStatus,
  ProductStatus,
} from "@/types";

type StatusType = "campaign_creator" | "content_submission" | "product";

interface StatusPillProps {
  status: string;
  type?: StatusType;
  className?: string;
  /** Override label text */
  label?: string;
}

function getConfig(status: string, type: StatusType) {
  switch (type) {
    case "campaign_creator":
      return CAMPAIGN_CREATOR_STATUS_CONFIG[status as CampaignCreatorStatus];
    case "content_submission":
      return CONTENT_SUBMISSION_STATUS_CONFIG[status as ContentSubmissionStatus];
    case "product":
      return PRODUCT_STATUS_CONFIG[status as ProductStatus];
    default:
      return null;
  }
}

export function StatusPill({
  status,
  type = "campaign_creator",
  className,
  label,
}: StatusPillProps) {
  const config = getConfig(status, type);

  if (!config) {
    return (
      <span className={cn("status-pill text-[#8A8A9A]", className)}>
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: "#8A8A9A" }}
        />
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn("status-pill", className)}
      style={{
        background: config.bgColor,
        color: config.dotColor,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: config.dotColor }}
      />
      {label || config.label}
    </span>
  );
}
