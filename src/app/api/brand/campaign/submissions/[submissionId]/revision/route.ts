import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";
import { revisionFeedbackSchema } from "@/lib/validators/brand";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/resend";
import { revisionRequested } from "@/lib/email/templates";
import { MAX_REVISIONS } from "@/lib/constants";

export async function POST(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const session = await validateBrandSession(req);
    if (!session || !session.campaignId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { submissionId } = params;
    const body = await req.json();

    const parsed = revisionFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { feedback } = parsed.data;
    const supabase = createServiceRoleClient();

    const { data: submission } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('id', submissionId)
      .eq('campaign_id', session.campaignId)
      .single();

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    const currentCount = submission.revision_count || 0;
    if (currentCount >= MAX_REVISIONS) {
      return NextResponse.json({ success: false, error: `Maximum revisions (${MAX_REVISIONS}) reached` }, { status: 400 });
    }

    const { data: updatedSubmission, error } = await supabase
      .from('content_submissions')
      .update({
        status: 'revision_requested',
        revision_feedback: feedback,
        revision_count: currentCount + 1,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('campaign_creators')
      .update({ 
        status: 'revision_requested', 
        revision_count: currentCount + 1,
        last_updated: new Date().toISOString() 
      })
      .eq('campaign_id', session.campaignId)
      .eq('creator_id', submission.creator_id);

    await logActivity({
      campaignId: session.campaignId,
      actorType: 'brand',
      actorId: session.brandId,
      actorName: session.companyName,
      action: `Requested revision #${currentCount + 1} for ${submission.product_name} by ${submission.creator_name}`,
      entityType: 'content_submission',
      entityId: submissionId,
    });

    const { data: creator } = await supabase
      .from('creators')
      .select('email')
      .eq('id', submission.creator_id)
      .single();

    if (creator?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const portalUrl = `${appUrl}/creator/campaign/${session.campaignId}`;

      await sendEmail({ to: creator.email, subject: `Revision Requested: ${submission.product_name}`, html: revisionRequested(submission.creator_name, submission.product_name, feedback, portalUrl) });
    }

    return NextResponse.json({ success: true, data: { submission: updatedSubmission } });

  } catch (err) {
    console.error('[BRAND REVISION ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
