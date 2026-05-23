"use client";

import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

export function SkeletonCard({ count = 4, className }: SkeletonCardProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="aspect-video skeleton-shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
            <div className="h-5 w-16 rounded-full skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
