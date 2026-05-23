"use client";

import { CreatorProvider } from "@/context/CreatorContext";
import { CreatorBottomNav } from "@/components/creator/CreatorBottomNav";
import { usePathname } from "next/navigation";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isJoinPage = pathname === "/creator/join";

  return (
    <CreatorProvider>
      <div className={`min-h-screen ${isJoinPage ? "" : "theme-creator bg-white"}`}>
        {!isJoinPage && (
          <header className="hidden md:flex sticky top-0 z-40 w-full border-b border-[rgba(0,0,0,0.07)] bg-white/95 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto w-full px-6 h-14 flex items-center">
              <span className="font-display font-bold text-lg text-[#111116]">Firstframe</span>
            </div>
          </header>
        )}
        <main className={isJoinPage ? "" : "max-w-3xl mx-auto px-6 py-6 pb-24 md:pb-8"}>
          {children}
        </main>
        {!isJoinPage && <CreatorBottomNav />}
      </div>
    </CreatorProvider>
  );
}
