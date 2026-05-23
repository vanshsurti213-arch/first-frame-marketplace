import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";

export async function GET(req: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = params;
    const supabase = createServiceRoleClient();

    const { data: submissions, error } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[ADMIN SUBMISSIONS GET ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch submissions' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { submissions: submissions || [] } });

  } catch (err) {
    console.error('[ADMIN SUBMISSIONS ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
