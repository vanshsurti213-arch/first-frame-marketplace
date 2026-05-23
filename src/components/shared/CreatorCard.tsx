"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Play, Lock, Check, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

interface CreatorCardProps {
  id: string;
  name: string;
  niche: string;
  city: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  isActive?: boolean;
  instagramHandle?: string;  // admin-only
  showAdminTag?: boolean;
  inCampaign?: boolean;
  onClick?: () => void;
  onVideoClick?: () => void;
  className?: string;
  variants?: any;
}

export function CreatorCard({
  name,
  niche,
  city,
  thumbnailUrl,
  videoUrl,
  isActive = true,
  instagramHandle,
  showAdminTag = false,
  inCampaign = false,
  onClick,
  onVideoClick,
  className,
  variants,
}: CreatorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleClick = () => {
    if (onVideoClick && videoUrl) {
      onVideoClick();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      variants={variants}
      className={cn("creator-card group", !isActive && "opacity-60", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
    >
      {/* Thumbnail / Video */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={name}
          className="creator-card__thumbnail"
          loading="lazy"
        />
      ) : !videoUrl ? (
        <div className="creator-card__thumbnail bg-gradient-to-br from-[#1A1A1F] to-[#0C0C0F] flex items-center justify-center">
          <span className="text-4xl font-display font-bold text-[#4A4A5A]">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      ) : null}

      {/* Video overlay */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={cn(
            "absolute inset-0 w-full h-full object-cover bg-black transition-opacity duration-300",
            (isHovered || !thumbnailUrl) ? "opacity-100" : "opacity-0"
          )}
          muted
          loop
          playsInline
        />
      )}

      {/* Mute Toggle */}
      {videoUrl && (
        <button
          onClick={toggleMute}
          className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/60 transition-all"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}

      {/* Gradient overlay */}
      <div className="creator-card__overlay" />

      {/* Play button */}
      {videoUrl && (
        <div className="creator-card__play">
          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
        </div>
      )}

      {/* Admin-only IG tag */}
      {showAdminTag && instagramHandle && (
        <div className="creator-card__admin-tag">
          <Lock className="w-3 h-3" />
          @{instagramHandle}
        </div>
      )}

      {/* In campaign checkmark */}
      {inCampaign && (
        <div className="creator-card__check">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Info */}
      <div className="creator-card__info">
        <div className="creator-card__name">{name}</div>
        <div className="creator-card__meta">
          <span className="creator-card__badge">{niche}</span>
          <span className="creator-card__city">{city}</span>
        </div>
      </div>
    </motion.div>
  );
}
