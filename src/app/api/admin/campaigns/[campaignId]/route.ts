import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = params;
    const supabase = createServiceRoleClient();

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error || !campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    const { data: creatorsData } = await supabase
      .from('campaign_creators')
      .select(`
        *,
        creators (id, name, email, niche, city, best_video_url, thumbnail_url, is_active, default_address, created_at, updated_at)
      `)
      .eq('campaign_id', campaignId);

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('campaign_id', campaignId);

    const { data: submissions } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('campaign_id', campaignId);

    const { data: activity_log } = await supabase
      .from('activity_log')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('timestamp', { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        creators: creatorsData || [],
        products: products || [],
        submissions: submissions || [],
        activity_log: activity_log || []
      }
    });

  } catch (err) {
    console.error('[ADMIN CAMPAIGN GET ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = params;
    const body = await req.json();
    const supabase = createServiceRoleClient();

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to update campaign' }, { status: 500 });
    }

    await logActivity({
      campaignId,
      actorType: 'admin',
      actorId: admin.id,
      actorName: admin.name,
      action: `Updated campaign details`,
      entityType: 'campaign',
      entityId: campaignId,
    });

    return NextResponse.json({ success: true, data: { campaign } });

  } catch (err) {
    console.error('[ADMIN CAMPAIGN PATCH ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
