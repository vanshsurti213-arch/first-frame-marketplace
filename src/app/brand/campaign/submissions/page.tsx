"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBrand } from "@/context/BrandContext";
import { createClient } from "@/lib/supabase/client";
import { StatusPill } from "@/components/shared/StatusPill";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { FullPageLoader } from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { MAX_REVISIONS } from "@/lib/constants";
import type { ContentSubmission } from "@/types";
import { FileVideo, ExternalLink, ArrowRight } from "lucide-react";

export default function BrandSubmissionsPage() {
  const { brand, loading: brandLoading } = useBrand();
  const supabase = createClient();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brandLoading) return;
    if (!brand?.campaignId) {
      router.push("/brand/campaign");
      return;
    }
    supabase.from("content_submissions").select("*").eq("campaign_id", brand.campaignId).order("submitted_at", { ascending: false }).then(({ data }) => {
      setSubmissions(data || []);
      setLoading(false);
    });
  }, [brand, brandLoading, supabase, router]);

  if (brandLoading || loading) return <FullPageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-[#111116]">Submissions</h1>
        <p className="text-sm text-[#5A5A6E] mt-1">Review creator video submissions</p>
      </div>
      {submissions.length === 0 ? (
        <EmptyState variant="light" icon={<FileVideo className="w-7 h-7 text-[#9A9AAA]" />} title="No submissions yet" description="Submissions will appear here once creators submit their content." />
      ) : (
        <div className="glass-card-light overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.05)]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Creator</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Submitted</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Drive Link</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9A9AAA]">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} className="table-row-hover-light border-b border-[rgba(0,0,0,0.04)] cursor-pointer" onClick={() => router.push(`/brand/campaign/submissions/${sub.id}`)}>
                  <td className="px-5 py-4 text-sm font-medium text-[#111116]">{sub.creator_name.split(" ")[0]}</td>
                  <td className="px-5 py-4 text-sm text-[#5A5A6E]">{sub.product_name}</td>
                  <td className="px-5 py-4 text-sm text-[#5A5A6E]">{formatDate(sub.submitted_at)}</td>
                  <td className="px-5 py-4">
                    <a href={sub.drive_link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#5BAAFF] hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="w-3 h-3" /> Open
                    </a>
                  </td>
                  <td className="px-5 py-4"><StatusPill status={sub.status} type="content_submission" /></td>
                  <td className="px-5 py-4 text-right"><ArrowRight className="w-4 h-4 text-[#9A9AAA] inline" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
