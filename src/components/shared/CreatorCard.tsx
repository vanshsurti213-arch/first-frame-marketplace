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
      if (thumbnailUrl) {
        videoRef.current.pause();
      }
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
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={name}
          className="creator-card__thumbnail"
        />
      ) : !videoUrl ? (
        <div className="creator-card__thumbnail flex items-center justify-center bg-gradient-to-br from-white/[0.04] to-black">
          <span className="text-6xl font-display font-light text-white opacity-20">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      ) : null}

      {/* Hover Video Player */}
      {videoUrl && (
        <div 
          className={`absolute inset-0 transition-opacity duration-500 z-10 bg-[#050505] ${
            (isHovered || !thumbnailUrl) ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            loop
            muted={isMuted}
            playsInline
            autoPlay={!thumbnailUrl}
            preload={thumbnailUrl ? "none" : "auto"}
            className="w-full h-full object-cover"
          />
          <button
            onClick={toggleMute}
            className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white border border-white/10 transition-all hover:bg-black/60"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="creator-card__overlay z-10 pointer-events-none" />

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
