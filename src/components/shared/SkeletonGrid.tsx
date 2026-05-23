"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonGridProps {
  count?: number;
  variant?: "dark" | "light";
  className?: string;
}

export function SkeletonGrid({
  count = 8,
  variant = "dark",
  className,
}: SkeletonGridProps) {
  const shimmerClass = variant === "dark" ? "skeleton-shimmer" : "skeleton-shimmer-light";

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-2xl overflow-hidden",
            variant === "dark"
              ? "border border-[rgba(255,255,255,0.09)]"
              : "border border-[rgba(0,0,0,0.07)]"
          )}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {/* 9:16 aspect ratio placeholder */}
          <div className={cn("aspect-[9/16] w-full", shimmerClass)} />
          {/* Info area */}
          <div className="p-4 space-y-3">
            <div className={cn("h-4 rounded w-3/4", shimmerClass)} />
            <div className="flex gap-2">
              <div className={cn("h-3 rounded-full w-16", shimmerClass)} />
              <div className={cn("h-3 rounded-full w-12", shimmerClass)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
