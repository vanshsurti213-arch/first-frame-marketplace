"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { CreatorCard } from "@/components/shared/CreatorCard";
import { VideoModal } from "@/components/shared/VideoModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonGrid } from "@/components/shared/SkeletonGrid";
import { LoadingSpinner, FullPageLoader } from "@/components/shared/LoadingSpinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creatorFormSchema, type CreatorFormValues } from "@/lib/validators/admin";
import { NICHE_OPTIONS } from "@/lib/constants";
import type { Creator } from "@/types";
import { toast } from "sonner";
import { Plus, X, Users, Search } from "lucide-react";

export default function AdminCreatorsPage() {
  const { admin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);
  const [videoModal, setVideoModal] = useState<{ url: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nicheFilter, setNicheFilter] = useState<string>("All");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatorFormValues>({
    resolver: zodResolver(creatorFormSchema),
  });

  const fetchCreators = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/creators");
      const json = await res.json();
      if (json.success) {
        setCreators(json.data.creators);
      } else {
        console.error("Fetch creators error:", json.error);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && admin) fetchCreators();
  }, [admin, authLoading, fetchCreators]);

  const openAddForm = () => {
    setEditingCreator(null);
    reset({
      name: "",
      niche: undefined,
      city: "",
      email: "",
      phone: "",
      instagram_handle: "",
      default_address: "",
    });
    setShowForm(true);
  };

  const openEditForm = (creator: Creator) => {
    setEditingCreator(creator);
    reset({
      name: creator.name,
      niche: creator.niche as CreatorFormValues["niche"],
      city: creator.city,
      email: creator.email,
      phone: creator.phone,
      instagram_handle: creator.instagram_handle,
      default_address: creator.default_address || "",
    });
    setShowForm(true);
  };

  const onSubmit = async (values: CreatorFormValues) => {
    try {
      if (editingCreator) {
        const { error } = await supabase
          .from("creators")
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCreator.id);
        if (error) throw error;
        toast.success("Creator updated successfully");
      } else {
        const { error } = await supabase.from("creators").insert({
          ...values,
          is_active: true,
        });
        if (error) throw error;
        toast.success("Creator added successfully");
      }
      setShowForm(false);
      fetchCreators();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save creator";
      toast.error(message);
    }
  };

  const toggleActive = async (creator: Creator) => {
    const { error } = await supabase
      .from("creators")
      .update({ is_active: !creator.is_active, updated_at: new Date().toISOString() })
      .eq("id", creator.id);
    if (error) {
      toast.error("Failed to update creator status");
    } else {
      toast.success(creator.is_active ? "Creator deactivated" : "Creator activated");
      fetchCreators();
    }
  };

  if (authLoading) return <FullPageLoader />;

  // Filter creators
  const filtered = creators.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instagram_handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNiche = nicheFilter === "All" || c.niche === nicheFilter;
    return matchesSearch && matchesNiche;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#F2F2F3]">
            Creator Pool
          </h1>
          <p className="text-sm text-[#8A8A9A] mt-1">
            {creators.length} creator{creators.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button onClick={openAddForm} className="btn-lime text-sm">
          <Plus className="w-4 h-4" />
          Add Creator
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A5A]" />
          <input
            type="text"
            placeholder="Search by name, city, or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] text-sm text-[#F2F2F3] placeholder:text-[#4A4A5A] focus:outline-none focus:border-[#CAFF4C] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", ...NICHE_OPTIONS].map((niche) => (
            <button
              key={niche}
              onClick={() => setNicheFilter(niche)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                nicheFilter === niche
                  ? "bg-[#CAFF4C] text-[#0C0C0F]"
                  : "bg-[rgba(255,255,255,0.04)] text-[#8A8A9A] hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              {niche}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7 text-[#4A4A5A]" />}
          title={searchQuery || nicheFilter !== "All" ? "No matching creators" : "No creators yet"}
          description={
            searchQuery || nicheFilter !== "All"
              ? "Try adjusting your search or filters."
              : "Add your first creator to get started."
          }
          action={
            !searchQuery && nicheFilter === "All" ? (
              <button onClick={openAddForm} className="btn-lime text-sm">
                <Plus className="w-4 h-4" />
                Add Creator
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((creator) => (
            <CreatorCard
              key={creator.id}
              id={creator.id}
              name={creator.name}
              niche={creator.niche}
              city={creator.city}
              thumbnailUrl={creator.thumbnail_url}
              videoUrl={creator.best_video_url}
              isActive={creator.is_active}
              instagramHandle={creator.instagram_handle}
              showAdminTag={true}
              onClick={() => openEditForm(creator)}
              onVideoClick={() => {
                if (creator.best_video_url) {
                  setVideoModal({ url: creator.best_video_url, name: creator.name });
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Video Modal */}
      {videoModal && (
        <VideoModal
          isOpen={true}
          onClose={() => setVideoModal(null)}
          videoUrl={videoModal.url}
          creatorName={videoModal.name}
        />
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto glass-card p-8 animate-scale-in">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.12)] transition-colors"
            >
              <X className="w-4 h-4 text-[#8A8A9A]" />
            </button>

            <h2 className="font-display font-bold text-xl text-[#F2F2F3] mb-6">
              {editingCreator ? "Edit Creator" : "Add Creator"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8A9A] mb-1.5">Name</label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] text-sm text-[#F2F2F3] placeholder:text-[#4A4A5A] focus:outline-none focus:border-[#CAFF4C] transition-colors"
                  placeholder="Full name"
                />
                {errors.name && <p className="mt-1 text-xs text-[#FF6B5B]">{errors.name.message}</p>}
              </div>

              {/* Niche */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8A9A] mb-1.5">Niche</label>
                <select
                  {...register("niche")}
                  className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] text-sm text-[#F2F2F3] focus:outline-none focus:border-[#CAFF4C] transition-colors"
                >
                  <option value="">Select niche</option>
                  {NICHE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                {errors.niche && <p className="mt-1 text-xs text-[#FF6B5B]">{errors.niche.message}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8A9A] mb-1.5">City</label>
                <input
                  {...register("city")}
                  className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] text-sm text-[#F2F2F3] placeholder:text-[#4A4A5A] focus:outline-none focus:border-[#CAFF4C] transition-colors"
                  placeholder="e.g. Mumbai"
                />
                {errors.city && <p className="mt-1 text-xs text-[#FF6B5B]">{errors.city.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8A9A] mb-1.5">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] text-sm text-[#F2F2F3] placeholder:text-[#4A4A5A] focus:outline-none focus:border-[#CAFF4C] transition-colors"
                  placeholder="creator@email.com"
                />
                {errors.email && <p className="mt-1 text-xs text-[#FF6B5B]">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8A9A] mb-1.5">Phone</label>
                <input
                  {...register("phone")}
                  className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] text-sm text-[#F2F2F3] placeholder:text-[#4A4A5A] focus:outline-none focus:border-[#CAFF4C] transition-colors"
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="mt-1 text-xs text-[#FF6B5B]">{errors.phone.message}</p>}
              </div>

              {/* Instagram Handle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8A9A] mb-1.5">Instagram Handle</label>
                <input
                  {...register("instagram_handle")}
                  className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] text-sm text-[#F2F2F3] placeholder:text-[#4A4A5A] focus:outline-none focus:border-[#CAFF4C] transition-colors"
                  placeholder="@handle"
                />
                {errors.instagram_handle && <p className="mt-1 text-xs text-[#FF6B5B]">{errors.instagram_handle.message}</p>}
              </div>

              {/* Default Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8A8A9A] mb-1.5">Default Address</label>
                <textarea
                  {...register("default_address")}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] text-sm text-[#F2F2F3] placeholder:text-[#4A4A5A] focus:outline-none focus:border-[#CAFF4C] transition-colors resize-none"
                  placeholder="Pre-filled shipping address"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isSubmitting} className="btn-lime flex-1 flex items-center justify-center gap-2">
                  {isSubmitting ? <LoadingSpinner size="sm" color="#0C0C0F" /> : null}
                  {editingCreator ? "Save Changes" : "Add Creator"}
                </button>
                {editingCreator && (
                  <button
                    type="button"
                    onClick={() => toggleActive(editingCreator)}
                    className={editingCreator.is_active ? "btn-danger flex-shrink-0" : "btn-lime flex-shrink-0"}
                  >
                    {editingCreator.is_active ? "Deactivate" : "Activate"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
