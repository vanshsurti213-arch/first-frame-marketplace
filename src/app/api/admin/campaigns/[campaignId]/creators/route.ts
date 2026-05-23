import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = params;
    const body = await req.json();
    
    if (!body.creator_id) {
       return NextResponse.json({ success: false, error: 'Creator ID is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Check if already in campaign
    const { data: existing } = await supabase
      .from('campaign_creators')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('creator_id', body.creator_id)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: 'Creator is already in this campaign' }, { status: 400 });
    }

    const { data: creator } = await supabase
      .from('creators')
      .select('name')
      .eq('id', body.creator_id)
      .single();

    if (!creator) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    const { data: campaignCreator, error } = await supabase
      .from('campaign_creators')
      .insert({
        campaign_id: campaignId,
        creator_id: body.creator_id,
        creator_name: creator.name,
        status: 'invited',
        invited_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[ADMIN INVITE ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to invite creator' }, { status: 500 });
    }

    await logActivity({
      campaignId,
      actorType: 'admin',
      actorId: admin.id,
      actorName: admin.name,
      action: `Invited creator: ${creator.name}`,
      entityType: 'campaign_creator',
      entityId: campaignCreator.id,
    });

    return NextResponse.json({ success: true, data: { campaignCreator } });

  } catch (err) {
    console.error('[ADMIN INVITE ROUTE ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
