"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has any existing session and redirect
    const brandSession = localStorage.getItem("firstframe_brand_session");
    const creatorSession = localStorage.getItem("firstframe_creator_session");

    if (brandSession) {
      router.replace("/brand/campaign");
    } else if (creatorSession) {
      router.replace("/creator/dashboard");
    } else {
      // Default redirect to admin login
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0C0C0F] flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <h1 className="font-display font-extrabold text-4xl text-white tracking-tight mb-3">
          Firstframe
        </h1>
        <p className="text-sm text-[#8A8A9A]">Redirecting...</p>
        <div className="mt-6 flex justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#CAFF4C] animate-pulse-dot" />
          <div className="w-2 h-2 rounded-full bg-[#CAFF4C] animate-pulse-dot" style={{ animationDelay: "200ms" }} />
          <div className="w-2 h-2 rounded-full bg-[#CAFF4C] animate-pulse-dot" style={{ animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
}
