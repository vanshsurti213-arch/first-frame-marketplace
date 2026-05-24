"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCreator } from "@/context/CreatorContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AlertCircle, Sparkles } from "lucide-react";

function CreatorJoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setCreatorSession } = useCreator();

  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [creatorName, setCreatorName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No token provided. Please use the link sent to you by Firstframe.");
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch("/api/creator/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!data.success) {
          setStatus("error");
          setErrorMessage(data.error || "This link is invalid or has expired.");
          return;
        }

        setCreatorName(data.data.creatorName);
        setStatus("success");
        sessionStorage.setItem("_ff_pending_session", JSON.stringify(data.data));
      } catch {
        setStatus("error");
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    };

    validate();
  }, [token]);

  const enterPortal = () => {
    const pendingSession = sessionStorage.getItem("_ff_pending_session");
    if (pendingSession) {
      const session = JSON.parse(pendingSession);
      setCreatorSession(session);
      sessionStorage.removeItem("_ff_pending_session");
      router.push("/creator/dashboard");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="#FFFFFF" />
          <p className="text-sm text-white/40 mt-4">Verifying your link...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5 border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-display font-bold text-xl text-white mb-2">
            Link Invalid
          </h1>
          <p className="text-sm text-white/40 mb-6">
            {errorMessage}
          </p>
          <p className="text-xs text-white/20">
            Contact Firstframe for a new link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/[0.02] blur-3xl -z-10 animate-pulse" />

      <div className="max-w-sm w-full text-center animate-fade-in relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>

        <h1 className="font-display font-bold text-3xl text-white mb-2">
          Hi {creatorName} 👋
        </h1>
        <p className="text-base text-white/40 mb-8 leading-relaxed">
          You&apos;ve been added to a campaign on Firstframe
        </p>

        <button
          onClick={enterPortal}
          className="btn-primary w-full text-base"
        >
          Enter Your Portal
        </button>
      </div>
    </div>
  );
}

export default function CreatorJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" color="#FFFFFF" />
            <p className="text-sm text-white/40 mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <CreatorJoinContent />
    </Suspense>
  );
}
