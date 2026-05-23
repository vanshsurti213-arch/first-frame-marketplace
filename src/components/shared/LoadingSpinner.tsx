"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  color,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-transparent",
        sizeMap[size],
        className
      )}
      style={{
        borderTopColor: color || "#CAFF4C",
        borderRightColor: "transparent",
        borderBottomColor: "transparent",
        borderLeftColor: color || "#CAFF4C",
      }}
    />
  );
}

interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({ message }: FullPageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-sm text-[#8A8A9A] animate-pulse">{message}</p>
      )}
    </div>
  );
}
