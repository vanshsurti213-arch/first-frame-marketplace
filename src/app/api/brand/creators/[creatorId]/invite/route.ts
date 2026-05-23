import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/resend";
import { newInvitePending } from "@/lib/email/templates";

export async function POST(
  req: NextRequest,
  { params }: { params: { creatorId: string } }
) {
  try {
    const session = await validateBrandSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.campaignId) {
      return NextResponse.json({ success: false, error: 'No active campaign' }, { status: 400 });
    }

    const { creatorId } = params;
    const supabase = createServiceRoleClient();

    // Check if already invited
    const { data: existing } = await supabase
      .from('campaign_creators')
      .select('id')
      .eq('campaign_id', session.campaignId)
      .eq('creator_id', creatorId)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: 'Creator is already in this campaign' }, { status: 400 });
    }

    // Get creator details
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('name')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('name')
      .eq('id', session.campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Insert campaign_creator
    const { data: campaignCreator, error: insertError } = await supabase
      .from('campaign_creators')
      .insert({
        campaign_id: session.campaignId,
        creator_id: creatorId,
        creator_name: creator.name,
        status: 'invited',
        invited_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('[BRAND INVITE INSERT ERROR]', insertError);
      return NextResponse.json({ success: false, error: 'Failed to invite creator' }, { status: 500 });
    }

    await logActivity({
      campaignId: session.campaignId,
      actorType: 'brand',
      actorId: session.brandId,
      actorName: session.companyName,
      action: `Requested to invite creator: ${creator.name}`,
      entityType: 'campaign_creator',
      entityId: campaignCreator.id,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const adminUrl = `${appUrl}/admin/campaigns/${session.campaignId}`;

    await sendEmail({ to: 'admin@firstframe.com', subject: 'New Creator Invite Request', html: newInvitePending('Admin', creator.name, campaign.name, session.companyName, adminUrl) });

    return NextResponse.json({ success: true, data: { campaignCreator } });

  } catch (err) {
    console.error('[BRAND INVITE ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
