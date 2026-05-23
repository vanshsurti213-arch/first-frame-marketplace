"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dark" | "light";
  hover?: boolean;
  children: React.ReactNode;
}

export function GlassCard({
  variant = "dark",
  hover = true,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        variant === "dark" ? "glass-card" : "glass-card-light",
        !hover && "hover:bg-transparent hover:border-transparent",
        "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
