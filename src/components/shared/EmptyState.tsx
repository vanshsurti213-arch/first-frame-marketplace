"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "dark" | "light";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "dark",
  className,
}: EmptyStateProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-5",
            isDark
              ? "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)]"
              : "bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.07)]"
          )}
        >
          {icon}
        </div>
      )}
      <h3
        className={cn(
          "font-display font-bold text-lg mb-2",
          isDark ? "text-[#F2F2F3]" : "text-[#111116]"
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "text-sm max-w-sm",
            isDark ? "text-[#8A8A9A]" : "text-[#5A5A6E]"
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
