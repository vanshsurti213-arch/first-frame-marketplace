"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { LogOut, ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/creators", label: "Creators" },
  { href: "/admin/codes", label: "Codes" },
  { href: "/admin/log", label: "Log" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { admin, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[rgba(255,255,255,0.07)] bg-[#0C0C0F]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left — Wordmark */}
        <Link href="/admin/dashboard" className="font-display font-bold text-xl text-white tracking-tight">
          Firstframe
        </Link>

        {/* Center — Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                  isActive
                    ? "text-[#CAFF4C]"
                    : "text-[#8A8A9A] hover:text-[#F2F2F3]"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#CAFF4C]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right — Admin dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 text-sm text-[#8A8A9A] hover:text-[#F2F2F3] transition-colors"
          >
            <span className="hidden sm:inline font-mono text-xs">
              {admin?.email || "admin"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 py-1 rounded-xl bg-[#1A1A1F] border border-[rgba(255,255,255,0.09)] shadow-2xl animate-scale-in">
                <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.07)]">
                  <p className="text-sm font-medium text-[#F2F2F3]">
                    {admin?.name || "Admin"}
                  </p>
                  <p className="text-xs text-[#4A4A5A] font-mono truncate">
                    {admin?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#FF6B5B] hover:bg-[rgba(255,107,91,0.08)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
