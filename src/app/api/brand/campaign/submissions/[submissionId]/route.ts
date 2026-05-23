import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const session = await validateBrandSession(req);
    if (!session || !session.campaignId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { submissionId } = params;
    const supabase = createServiceRoleClient();

    const { data: submission, error } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('id', submissionId)
      .eq('campaign_id', session.campaignId)
      .single();

    if (error || !submission) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { submission } });

  } catch (err) {
    console.error('[BRAND SUBMISSION GET ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
