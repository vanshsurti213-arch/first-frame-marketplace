"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBrand } from "@/context/BrandContext";
import { LogOut } from "lucide-react";

const NAV_LINKS = [
  { href: "/brand/campaign", label: "Campaign" },
  { href: "/brand/creators", label: "Creators" },
  { href: "/brand/campaign/products/new", label: "Products" },
  { href: "/brand/campaign/submissions", label: "Submissions" },
];

export function BrandNav() {
  const pathname = usePathname();
  const { brand, clearSession } = useBrand();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left — Wordmark × Brand */}
        <Link href="/brand/campaign" className="font-display font-bold text-lg text-white tracking-tight">
          Firstframe <span className="text-white/30 font-normal">×</span>{" "}
          <span className="text-white/80">{brand?.companyName || "Brand"}</span>
        </Link>

        {/* Center — Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                  isActive
                    ? "text-white bg-white/[0.04]"
                    : "text-white/40 hover:text-white hover:bg-white/[0.02]"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right — Logout */}
        <button
          onClick={clearSession}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
