import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { count: activeCampaignsCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: pendingInvitesCount } = await supabase
      .from('campaign_creators')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'invited');

    const { count: pendingReviewsCount } = await supabase
      .from('content_submissions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['submitted', 'under_review']);

    const { count: activeCreatorsCount } = await supabase
      .from('creators')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          activeCampaigns: activeCampaignsCount || 0,
          pendingInvites: pendingInvitesCount || 0,
          pendingReviews: pendingReviewsCount || 0,
          activeCreators: activeCreatorsCount || 0
        },
        campaigns: campaigns || []
      }
    });

  } catch (err) {
    console.error('[ADMIN DASHBOARD ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
