"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCreator } from "@/context/CreatorContext";
import { Home, Briefcase, HelpCircle } from "lucide-react";

export function CreatorBottomNav() {
  const pathname = usePathname();
  const { creator } = useCreator();

  const NAV_ITEMS = [
    { href: "/creator/dashboard", label: "Home", icon: Home },
    { href: `/creator/campaign`, label: "Campaign", icon: Briefcase },
    { href: "#", label: "Help", icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[rgba(0,0,0,0.07)] md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== "#";
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 min-w-[64px] min-h-[44px] justify-center"
            >
              <Icon
                className="w-5 h-5"
                style={{ color: isActive ? "#CAFF4C" : "#9A9AAA" }}
                fill={isActive ? "#CAFF4C" : "none"}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "#111116" : "#9A9AAA" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
