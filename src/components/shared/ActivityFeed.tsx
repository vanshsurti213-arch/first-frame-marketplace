"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityLogEntry } from "@/types";

interface ActivityFeedProps {
  entries: ActivityLogEntry[];
  variant?: "dark" | "light";
  className?: string;
}

const ACTOR_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: "rgba(202,255,76,0.12)", text: "#CAFF4C" },
  brand: { bg: "rgba(91,170,255,0.12)", text: "#5BAAFF" },
  creator: { bg: "rgba(244,114,182,0.12)", text: "#F472B6" },
};

export function ActivityFeed({
  entries,
  variant = "dark",
  className,
}: ActivityFeedProps) {
  const isDark = variant === "dark";

  if (entries.length === 0) {
    return (
      <div className={cn("py-8 text-center", isDark ? "text-[#4A4A5A]" : "text-[#9A9AAA]")}>
        No activity yet
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {entries.map((entry) => {
        const badge = ACTOR_BADGE_COLORS[entry.actor_type] || ACTOR_BADGE_COLORS.admin;
        return (
          <div
            key={entry.id}
            className={cn(
              "flex items-start gap-3 px-4 py-3 border-b",
              isDark
                ? "border-[rgba(255,255,255,0.05)]"
                : "border-[rgba(0,0,0,0.05)]"
            )}
          >
            <span
              className={cn(
                "text-xs font-mono shrink-0 pt-0.5",
                isDark ? "text-[#4A4A5A]" : "text-[#9A9AAA]"
              )}
            >
              {formatRelativeTime(entry.timestamp)}
            </span>
            <span
              className="text-2xs font-semibold uppercase px-1.5 py-0.5 rounded shrink-0"
              style={{ background: badge.bg, color: badge.text }}
            >
              {entry.actor_type}
            </span>
            <span
              className={cn(
                "text-sm font-medium shrink-0",
                isDark ? "text-[#F2F2F3]" : "text-[#111116]"
              )}
            >
              {entry.actor_name}
            </span>
            <span className={cn("text-sm", isDark ? "text-[#8A8A9A]" : "text-[#5A5A6E]")}>
              — {entry.action}
            </span>
          </div>
        );
      })}
    </div>
  );
}
