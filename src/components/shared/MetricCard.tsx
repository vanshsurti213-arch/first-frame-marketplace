"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  className?: string;
}

export function MetricCard({ label, value, icon, className }: MetricCardProps) {
  return (
    <div className={cn("metric-card relative group", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-heading font-bold text-white tracking-tight">{value}</p>
          <p className="text-sm text-ff-muted mt-1">{label}</p>
        </div>
        <div className="text-ff-lime/60 group-hover:text-ff-lime transition-colors">
          {icon}
        </div>
      </div>
    </div>
  );
}
