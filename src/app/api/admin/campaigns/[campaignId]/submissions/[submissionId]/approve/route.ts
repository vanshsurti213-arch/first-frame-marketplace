import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/resend";
import { contentApproved } from "@/lib/email/templates";

export async function POST(
  req: NextRequest,
  { params }: { params: { campaignId: string; submissionId: string } }
) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, submissionId } = params;
    const supabase = createServiceRoleClient();

    const { data: submission } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('id', submissionId)
      .eq('campaign_id', campaignId)
      .single();

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    const { data: updatedSubmission, error } = await supabase
      .from('content_submissions')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('campaign_creators')
      .update({ status: 'content_approved', last_updated: new Date().toISOString() })
      .eq('campaign_id', campaignId)
      .eq('creator_id', submission.creator_id);

    await logActivity({
      campaignId,
      actorType: 'admin',
      actorId: admin.id,
      actorName: admin.name,
      action: `Approved content for ${submission.product_name} by ${submission.creator_name}`,
      entityType: 'content_submission',
      entityId: submissionId,
    });

    const { data: creator } = await supabase
      .from('creators')
      .select('email')
      .eq('id', submission.creator_id)
      .single();

    if (creator?.email) {
      await sendEmail({ to: creator.email, subject: `Content Approved: ${submission.product_name}`, html: contentApproved(submission.creator_name, submission.product_name) });
    }

    return NextResponse.json({ success: true, data: { submission: updatedSubmission } });

  } catch (err) {
    console.error('[ADMIN APPROVE SUBMISSION ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
