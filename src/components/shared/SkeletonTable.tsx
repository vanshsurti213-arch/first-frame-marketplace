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

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      {/* Header row */}
      <div className="flex gap-4 px-4 py-3 mb-2">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={`head-${i}`}
            className={cn("h-3 rounded-full", shimmerClass)}
            style={{ width: `${60 + Math.random() * 80}px` }}
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
                width: `${40 + Math.random() * 120}px`,
                animationDelay: `${rowIdx * 100 + colIdx * 50}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
