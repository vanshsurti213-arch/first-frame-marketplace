"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCreator } from "@/context/CreatorContext";
import { createClient } from "@/lib/supabase/client";
import { StatusPill } from "@/components/shared/StatusPill";
import { FullPageLoader, LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { isValidDriveLink, formatDate } from "@/lib/utils";
import type { Product, CreatorPreference, ContentSubmission } from "@/types";
import { MAX_REVISIONS } from "@/lib/constants";
import { toast } from "sonner";
import { Check, ExternalLink, AlertTriangle, ArrowLeft, Package, Truck, FileText, Video } from "lucide-react";

export default function CreatorProductDetailPage() {
  const { campaignId, productId } = useParams<{ campaignId: string; productId: string }>();
  const { creator, loading: creatorLoading } = useCreator();
  const supabase = createClient();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [preference, setPreference] = useState<CreatorPreference | null>(null);
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [driveLink, setDriveLink] = useState("");
  const [driveLinkError, setDriveLinkError] = useState("");
  const [isSubmittingPref, setIsSubmittingPref] = useState(false);
  const [isSubmittingContent, setIsSubmittingContent] = useState(false);

  useEffect(() => {
    if (creatorLoading || !creator?.creatorId || !productId) return;
    const fetchData = async () => {
      const [prodRes, prefRes, subRes] = await Promise.all([
        supabase.from("products").select("*").eq("id", productId).single(),
        supabase.from("creator_preferences").select("*").eq("product_id", productId).eq("creator_id", creator.creatorId).maybeSingle(),
        supabase.from("content_submissions").select("*").eq("product_id", productId).eq("creator_id", creator.creatorId).order("submitted_at", { ascending: false }),
      ]);
      setProduct(prodRes.data);
      setPreference(prefRes.data || null);
      setSubmissions(subRes.data || []);
      if (prefRes.data) setSelectedVariant(prefRes.data.selected_variant_id);
      setLoading(false);
    };
    fetchData();
  }, [creator, creatorLoading, productId, supabase]);

  const submitPreference = async () => {
    if (!product || !selectedVariant || !creator) return;
    setIsSubmittingPref(true);
    const variant = product.variants?.find((v) => v.id === selectedVariant);
    const { error } = await supabase.from("creator_preferences").insert({
      campaign_id: campaignId,
      product_id: productId,
      creator_id: creator.creatorId,
      creator_name: creator.creatorName,
      selected_variant_id: selectedVariant,
      selected_variant_label: variant?.label || "",
    });
    if (error) { toast.error("Failed to submit preference"); setIsSubmittingPref(false); return; }
    toast.success("Preference submitted!");
    // Refresh
    const { data } = await supabase.from("creator_preferences").select("*").eq("product_id", productId).eq("creator_id", creator.creatorId).single();
    setPreference(data);
    setIsSubmittingPref(false);
  };

  const submitContent = async () => {
    if (!driveLink.trim()) { setDriveLinkError("Please enter a Google Drive link"); return; }
    if (!isValidDriveLink(driveLink)) { setDriveLinkError("Please enter a valid Google Drive link"); return; }
    setDriveLinkError("");
    setIsSubmittingContent(true);
    const { error } = await supabase.from("content_submissions").insert({
      campaign_id: campaignId,
      product_id: productId,
      creator_id: creator!.creatorId,
      creator_name: creator!.creatorName,
      product_name: product!.name,
      drive_link: driveLink,
      status: "submitted",
      revision_count: submissions.length > 0 ? submissions[0].revision_count : 0,
    });
    if (error) { toast.error("Failed to submit"); setIsSubmittingContent(false); return; }
    toast.success("Video submitted!");
    setDriveLink("");
    // Refresh
    const { data } = await supabase.from("content_submissions").select("*").eq("product_id", productId).eq("creator_id", creator!.creatorId).order("submitted_at", { ascending: false });
    setSubmissions(data || []);
    setIsSubmittingContent(false);
  };

  if (creatorLoading || loading) return <FullPageLoader />;
  if (!product) return <div className="text-center py-20 text-[#5A5A6E]">Product not found</div>;

  const latestSub = submissions[0];
  const hasRevisionFeedback = latestSub?.status === "revision_requested" && latestSub.revision_feedback;

  return (
    <div className="animate-fade-in">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[#5A5A6E] hover:text-[#111116] mb-4 min-h-[44px] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="font-display font-bold text-xl text-[#111116] mb-6">{product.name}</h1>

      {/* Section 1: Preference */}
      {!preference ? (
        <section className="mb-8">
          <h2 className="font-display font-semibold text-base text-[#111116] mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" /> Choose your preferred variant
          </h2>
          <div className="space-y-2 mb-4">
            {product.variants?.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                className={`w-full min-h-[64px] px-5 py-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                  selectedVariant === variant.id
                    ? "border-[#CAFF4C] bg-[rgba(202,255,76,0.06)]"
                    : "border-[rgba(0,0,0,0.07)] bg-[#F5F5F7] hover:border-[rgba(0,0,0,0.15)]"
                }`}
              >
                <span className="text-sm font-medium text-[#111116]">{variant.label}</span>
                {selectedVariant === variant.id && <Check className="w-5 h-5 text-[#CAFF4C]" />}
              </button>
            ))}
          </div>
          <button onClick={submitPreference} disabled={!selectedVariant || isSubmittingPref} className="btn-lime-pill w-full text-base disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmittingPref ? <LoadingSpinner size="sm" color="#0C0C0F" /> : null}
            Submit My Preference
          </button>
        </section>
      ) : (
        <section className="mb-8">
          <div className="glass-card-light p-5">
            <div className="flex items-center gap-2 text-sm text-[#2DD4A1] mb-1">
              <Check className="w-4 h-4" /> Your choice
            </div>
            <p className="font-semibold text-[#111116]">{preference.selected_variant_label}</p>
          </div>
        </section>
      )}

      {/* Section 2: Tracking (if product dispatched) */}
      {product.status === "dispatched" && (
        <section className="mb-8">
          <div className="glass-card-light p-5 border-l-4 border-l-[#5BAAFF]">
            <div className="flex items-center gap-2 text-sm text-[#5BAAFF] mb-1">
              <Truck className="w-4 h-4" /> Your product is on its way
            </div>
            {product.tracking_link && (
              <a href={product.tracking_link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#5BAAFF] underline flex items-center gap-1 mt-2">
                Track Shipment <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* Section 3: Brief */}
      {(product.script_content || product.brief_url) && preference && (
        <section className="mb-8">
          <h2 className="font-display font-semibold text-base text-[#111116] mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Brief
          </h2>
          <div className="glass-card-light p-5">
            {product.script_content && (
              <div className="prose prose-sm max-w-none text-[#111116] mb-4" style={{ fontSize: "16px", lineHeight: "1.8" }}>
                {product.script_content}
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {product.brief_url && (
                <a href={product.brief_url} target="_blank" rel="noopener noreferrer" className="btn-ghost-light text-xs">
                  Open Full Brief <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {product.sop_url && (
                <a href={product.sop_url} target="_blank" rel="noopener noreferrer" className="btn-ghost-light text-xs">
                  View SOP <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-xs text-[#9A9AAA] mt-3">Brief v{product.script_version} — Updated {formatDate(product.updated_at)}</p>
          </div>
        </section>
      )}

      {/* Section 4: Submission */}
      {preference && (
        <section className="mb-8">
          <h2 className="font-display font-semibold text-base text-[#111116] mb-3 flex items-center gap-2">
            <Video className="w-4 h-4" /> Submit Your Video
          </h2>

          {/* Revision feedback */}
          {hasRevisionFeedback && (
            <div className="p-4 rounded-xl bg-[rgba(255,181,71,0.06)] border border-[rgba(255,181,71,0.15)] mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FFB547] mb-1">
                <AlertTriangle className="w-4 h-4" /> Revision Needed
              </div>
              <p className="text-sm text-[#5A5A6E]">{latestSub.revision_feedback}</p>
            </div>
          )}

          {/* Content approved */}
          {latestSub?.status === "approved" ? (
            <div className="p-5 rounded-xl bg-[rgba(45,212,161,0.06)] border border-[rgba(45,212,161,0.15)] text-center">
              <Check className="w-8 h-8 text-[#2DD4A1] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#2DD4A1]">Approved ✓ Great work!</p>
              {latestSub.approved_at && <p className="text-xs text-[#5A5A6E] mt-1">Approved on {formatDate(latestSub.approved_at)}</p>}
            </div>
          ) : (
            <>
              {/* Drive link input */}
              <div className="glass-card-light p-5 mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A5A6E] mb-2">
                  Google Drive Link
                </label>
                <input
                  type="url"
                  inputMode="url"
                  value={driveLink}
                  onChange={(e) => { setDriveLink(e.target.value); setDriveLinkError(""); }}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.07)] text-sm text-[#111116] placeholder:text-[#9A9AAA] focus:outline-none focus:border-[#CAFF4C]"
                  style={{ fontSize: "16px" }}
                />
                {driveLinkError && <p className="mt-1.5 text-xs text-[#FF6B5B]">{driveLinkError}</p>}
                <button onClick={submitContent} disabled={isSubmittingContent} className="btn-lime-pill w-full mt-4 text-base flex items-center justify-center gap-2">
                  {isSubmittingContent ? <LoadingSpinner size="sm" color="#0C0C0F" /> : null}
                  Submit Video
                </button>
              </div>
            </>
          )}

          {/* Submission history */}
          {submissions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9A9AAA] mb-2">Submission History</h3>
              <div className="space-y-2">
                {submissions.map((sub, i) => (
                  <div key={sub.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#9A9AAA]">v{submissions.length - i}</span>
                      <StatusPill status={sub.status} type="content_submission" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#9A9AAA]">{formatDate(sub.submitted_at)}</span>
                      <a href={sub.drive_link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#5BAAFF]">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
