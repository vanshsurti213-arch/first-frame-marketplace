"use client";

import { BrandProvider } from "@/context/BrandContext";
import { BrandNav } from "@/components/brand/BrandNav";
import { usePathname } from "next/navigation";

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/brand/login";

  return (
    <BrandProvider>
      <div className={`min-h-screen ${isLoginPage ? "" : "theme-brand bg-[#F7F7F8]"}`}>
        {!isLoginPage && <BrandNav />}
        <main className={isLoginPage ? "" : "max-w-7xl mx-auto px-6 py-8"}>
          {children}
        </main>
      </div>
    </BrandProvider>
  );
}
