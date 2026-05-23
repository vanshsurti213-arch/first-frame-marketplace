import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";
import { sanitizeCreator } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await validateBrandSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.campaignId) {
       return NextResponse.json({ success: false, error: 'No active campaign' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', session.campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Compute metrics
    const { data: creatorsCount } = await supabase
      .from('campaign_creators')
      .select('status')
      .eq('campaign_id', session.campaignId);

    const metrics = {
      invited: 0,
      accepted: 0,
      dispatched: 0,
      completed: 0,
    };

    if (creatorsCount) {
      creatorsCount.forEach((c: any) => {
        if (c.status === 'invited') metrics.invited++;
        else if (c.status === 'accepted' || c.status === 'preference_pending' || c.status === 'preference_submitted') metrics.accepted++;
        else if (c.status === 'product_dispatched' || c.status === 'brief_received' || c.status === 'content_submitted' || c.status === 'revision_requested') metrics.dispatched++;
        else if (c.status === 'content_approved' || c.status === 'payment_processing' || c.status === 'completed') metrics.completed++;
      });
    }

    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', session.campaignId);

    const { count: pendingReviewCount } = await supabase
      .from('content_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', session.campaignId)
      .in('status', ['submitted', 'under_review']);

    const { data: recentCreatorsData } = await supabase
      .from('campaign_creators')
      .select(`
        *,
        creators (*)
      `)
      .eq('campaign_id', session.campaignId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    const recentCreators = (recentCreatorsData || []).map((cc: any) => {
        if (cc.creators) {
           cc.creators = sanitizeCreator(cc.creators);
        }
        return cc;
    });

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        metrics: {
          ...metrics,
          products: productCount || 0,
          pendingReviews: pendingReviewCount || 0
        },
        recentCreators
      }
    });

  } catch (err) {
    console.error('[BRAND CAMPAIGN ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
