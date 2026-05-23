import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateCreatorSession } from "@/lib/auth-helpers";
import { contentSubmissionSchema } from "@/lib/validators/creator";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/resend";
import { newSubmissionReady } from "@/lib/email/templates";

export async function POST(
  req: NextRequest,
  { params }: { params: { campaignId: string; productId: string } }
) {
  try {
    const session = await validateCreatorSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, productId } = params;
    const body = await req.json();

    const parsed = contentSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { driveLink } = parsed.data;
    const supabase = createServiceRoleClient();

    // Verify creator is assigned to this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('name, assigned_creator_ids')
      .eq('id', productId)
      .single();

    if (productError || !product || !product.assigned_creator_ids?.includes(session.creatorId)) {
      return NextResponse.json({ success: false, error: 'Not assigned to this product' }, { status: 403 });
    }

    // Check if an existing submission exists
    const { data: existingSubmission } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.creatorId)
      .eq('product_id', productId)
      .single();

    let submissionResult;
    let actionLog = 'Submitted content';

    if (existingSubmission) {
      if (existingSubmission.status !== 'revision_requested') {
        return NextResponse.json({ success: false, error: 'Submission cannot be updated in its current status' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('content_submissions')
        .update({
          drive_link: driveLink,
          status: 'submitted',
          revision_count: (existingSubmission.revision_count || 0) + 1,
          submitted_at: new Date().toISOString()
        })
        .eq('id', existingSubmission.id)
        .select()
        .single();

      if (error) throw error;
      submissionResult = data;
      actionLog = 'Resubmitted content (revision)';
    } else {
      const { data, error } = await supabase
        .from('content_submissions')
        .insert({
          campaign_id: campaignId,
          creator_id: session.creatorId,
          creator_name: session.creatorName,
          product_id: productId,
          product_name: product.name,
          drive_link: driveLink,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      submissionResult = data;
    }

    // Update campaign_creator status
    await supabase
      .from('campaign_creators')
      .update({ status: 'content_submitted', last_updated: new Date().toISOString() })
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.creatorId);

    await logActivity({
      campaignId,
      actorType: 'creator',
      actorId: session.creatorId,
      actorName: session.creatorName,
      action: actionLog,
      entityType: 'content_submission',
      entityId: submissionResult.id,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const reviewUrl = `${appUrl}/admin/campaigns/${campaignId}`;

    await sendEmail({ to: 'admin@firstframe.com', subject: // Would normally map to brand/admin email
      'New Content Submission Ready', html: newSubmissionReady('Admin', session.creatorName, product.name, reviewUrl) });

    return NextResponse.json({ success: true, data: submissionResult });

  } catch (err) {
    console.error('[CREATOR SUBMIT ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
