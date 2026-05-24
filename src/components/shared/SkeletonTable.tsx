"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  variant?: "dark" | "light";
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  cols = 5,
  variant = "dark",
  className,
}: SkeletonTableProps) {
  const shimmerClass = variant === "dark" ? "skeleton-shimmer" : "skeleton-shimmer-light";

  // Deterministic widths to avoid SSR hydration mismatch
  const HEADER_WIDTHS = [80, 120, 100, 90, 110, 70, 130, 95];
  const CELL_WIDTHS = [100, 80, 140, 60, 120, 90, 110, 70, 130, 150];

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      {/* Header row */}
      <div className="flex gap-4 px-4 py-3 mb-2">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={`head-${i}`}
            className={cn("h-3 rounded-full", shimmerClass)}
            style={{ width: `${HEADER_WIDTHS[i % HEADER_WIDTHS.length]}px` }}
          />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className={cn(
            "flex gap-4 px-4 py-4 border-b",
            variant === "dark"
              ? "border-[rgba(255,255,255,0.05)]"
              : "border-[rgba(0,0,0,0.05)]"
          )}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={`cell-${rowIdx}-${colIdx}`}
              className={cn("h-4 rounded", shimmerClass)}
              style={{
                width: `${CELL_WIDTHS[(rowIdx * cols + colIdx) % CELL_WIDTHS.length]}px`,
                animationDelay: `${rowIdx * 100 + colIdx * 50}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
