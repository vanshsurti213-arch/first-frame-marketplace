"use client";

import React, { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  creatorName?: string;
}

export function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  creatorName,
}: VideoModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center video-modal-backdrop animate-fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className={cn(
          "absolute top-6 right-6 w-10 h-10 rounded-full",
          "bg-[rgba(255,255,255,0.12)] backdrop-blur-xl",
          "border border-[rgba(255,255,255,0.2)]",
          "flex items-center justify-center",
          "hover:bg-[rgba(255,255,255,0.2)] transition-colors",
          "z-10"
        )}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Video container */}
      <div
        className="relative w-full max-w-[480px] mx-4 animate-scale-in"
        style={{ aspectRatio: "9/16" }}
        onClick={(e) => e.stopPropagation()}
      >
        <video
          src={videoUrl}
          className="w-full h-full object-cover rounded-2xl"
          controls
          autoPlay
          playsInline
        />
        {creatorName && (
          <div className="absolute bottom-4 left-4 right-4">
            <p className="font-display font-bold text-white text-lg drop-shadow-lg">
              {creatorName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
