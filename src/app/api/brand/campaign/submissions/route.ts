import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await validateBrandSession(req);
    if (!session || !session.campaignId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { data: submissions, error } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('campaign_id', session.campaignId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[BRAND SUBMISSIONS GET ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch submissions' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { submissions: submissions || [] } });

  } catch (err) {
    console.error('[BRAND SUBMISSIONS ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
