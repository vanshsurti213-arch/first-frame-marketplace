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
    <nav className="sticky top-0 z-40 w-full border-b border-[rgba(0,0,0,0.07)] bg-[#F7F7F8]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left — Wordmark × Brand */}
        <Link href="/brand/campaign" className="font-display font-bold text-lg text-[#111116] tracking-tight">
          Firstframe <span className="text-[#9A9AAA] font-normal">×</span>{" "}
          <span className="text-[#111116]">{brand?.companyName || "Brand"}</span>
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
                    ? "text-[#111116]"
                    : "text-[#9A9AAA] hover:text-[#5A5A6E]"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#CAFF4C]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right — Logout */}
        <button
          onClick={clearSession}
          className="flex items-center gap-2 text-sm text-[#9A9AAA] hover:text-[#5A5A6E] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
