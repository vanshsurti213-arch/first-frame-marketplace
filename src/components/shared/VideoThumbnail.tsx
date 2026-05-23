"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface VideoThumbnailProps {
  thumbnailUrl: string;
  videoUrl: string;
  alt: string;
  className?: string;
}

export function VideoThumbnail({ thumbnailUrl, videoUrl, alt, className }: VideoThumbnailProps) {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    videoRef.current?.play().catch(() => {/* ignore autoplay failures */});
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={cn("relative overflow-hidden bg-white/[0.03] cursor-pointer", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail */}
      <img
        src={thumbnailUrl}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-200",
          isHovering ? "opacity-0" : "opacity-100"
        )}
        loading="lazy"
      />

      {/* Video (hidden until hover) */}
      <video
        ref={videoRef}
        src={videoUrl}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-200",
          isHovering ? "opacity-100" : "opacity-0"
        )}
        muted
        loop
        playsInline
        preload="none"
      />

      {/* Play icon overlay */}
      {!isHovering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
          </div>
        </div>
      )}
    </div>
  );
}
