"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useBrand } from "@/context/BrandContext";
import { StatusPill } from "@/components/shared/StatusPill";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { MAX_REVISIONS } from "@/lib/constants";
import type { ContentSubmission } from "@/types";
import { toast } from "sonner";
import { ExternalLink, CheckCircle, MessageSquare, AlertTriangle, ArrowLeft } from "lucide-react";

export default function BrandSubmissionReviewPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { brand } = useBrand();
  const supabase = createClient();
  const router = useRouter();
  const [submission, setSubmission] = useState<ContentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (!submissionId) return;
    supabase.from("content_submissions").select("*").eq("id", submissionId).single().then(({ data }) => {
      setSubmission(data);
      setLoading(false);
    });
  }, [submissionId, supabase]);

  const approve = async () => {
    if (!submission) return;
    setIsApproving(true);
    const { error } = await supabase.from("content_submissions").update({ status: "approved", approved_at: new Date().toISOString(), reviewed_at: new Date().toISOString() }).eq("id", submission.id);
    if (error) { toast.error("Failed to approve"); setIsApproving(false); return; }
    toast.success("Submission approved!");
    router.push("/brand/campaign/submissions");
  };

  const requestRevision = async () => {
    if (!submission || feedback.trim().length < 10) { toast.error("Please provide detailed feedback"); return; }
    setIsRequesting(true);
    const { error } = await supabase.from("content_submissions").update({ status: "revision_requested", revision_feedback: feedback, revision_count: submission.revision_count + 1, reviewed_at: new Date().toISOString() }).eq("id", submission.id);
    if (error) { toast.error("Failed to request revision"); setIsRequesting(false); return; }
    toast.success("Revision requested");
    router.push("/brand/campaign/submissions");
  };

  if (loading) return <FullPageLoader />;
  if (!submission) return <div className="text-center py-20 text-[#5A5A6E]">Submission not found</div>;

  const maxRevisionsReached = submission.revision_count >= MAX_REVISIONS;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[#5A5A6E] hover:text-[#111116] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to submissions
      </button>

      <div className="glass-card-light p-8">
        <div className="mb-6">
          <h1 className="font-display font-bold text-xl text-[#111116]">
            {submission.creator_name.split(" ")[0]} — {submission.product_name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusPill status={submission.status} type="content_submission" />
            <span className="text-xs text-[#5A5A6E]">Rev {submission.revision_count} of {MAX_REVISIONS}</span>
          </div>
        </div>

        {/* Drive link */}
        <a href={submission.drive_link} target="_blank" rel="noopener noreferrer" className="btn-lime w-full flex items-center justify-center gap-2 mb-6 text-base">
          <ExternalLink className="w-5 h-5" /> Open Video ↗
        </a>

        {/* Submitted at */}
        <p className="text-sm text-[#5A5A6E] mb-6">Submitted on {formatDate(submission.submitted_at)}</p>

        {/* Previous feedback */}
        {submission.revision_feedback && (
          <div className="mb-6 p-4 rounded-xl bg-[rgba(255,181,71,0.06)] border border-[rgba(255,181,71,0.15)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FFB547] mb-1">Previous Feedback</p>
            <p className="text-sm text-[#5A5A6E]">{submission.revision_feedback}</p>
          </div>
        )}

        {/* Actions */}
        {(submission.status === "submitted" || submission.status === "under_review") && (
          <div className="space-y-4">
            <button onClick={approve} disabled={isApproving} className="w-full py-3 rounded-xl bg-[#2DD4A1] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#26BC90] transition-colors disabled:opacity-50">
              <CheckCircle className="w-5 h-5" /> {isApproving ? "Approving..." : "Approve"}
            </button>

            {maxRevisionsReached ? (
              <div className="p-4 rounded-xl bg-[rgba(255,107,91,0.06)] border border-[rgba(255,107,91,0.12)] flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FF6B5B] flex-shrink-0" />
                <p className="text-sm text-[#FF6B5B]">Maximum revisions reached — Firstframe team has been notified</p>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What needs to change?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border border-[rgba(0,0,0,0.07)] text-sm text-[#111116] placeholder:text-[#9A9AAA] focus:outline-none focus:border-[#FFB547] resize-none"
                />
                <button onClick={requestRevision} disabled={isRequesting} className="w-full py-3 rounded-xl bg-[rgba(255,181,71,0.1)] text-[#FFB547] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[rgba(255,181,71,0.15)] transition-colors border border-[rgba(255,181,71,0.2)] disabled:opacity-50">
                  <MessageSquare className="w-5 h-5" /> {isRequesting ? "Sending..." : `Request Revision (${submission.revision_count + 1} of ${MAX_REVISIONS})`}
                </button>
              </div>
            )}
          </div>
        )}

        {submission.status === "approved" && (
          <div className="p-4 rounded-xl bg-[rgba(45,212,161,0.06)] border border-[rgba(45,212,161,0.15)] text-center">
            <CheckCircle className="w-8 h-8 text-[#2DD4A1] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#2DD4A1]">This submission has been approved</p>
            {submission.approved_at && <p className="text-xs text-[#5A5A6E] mt-1">Approved on {formatDate(submission.approved_at)}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
