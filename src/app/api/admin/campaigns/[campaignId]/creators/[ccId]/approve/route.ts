import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { approveInviteSchema } from "@/lib/validators/admin";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/resend";
import { creatorAddedToCampaign } from "@/lib/email/templates";

export async function POST(
  req: NextRequest, 
  { params }: { params: { campaignId: string; ccId: string } }
) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, ccId } = params;
    const body = await req.json();
    
    const parsed = approveInviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { agreed_rate, brand_rate } = parsed.data;
    const supabase = createServiceRoleClient();

    // Check if any active products exist to determine next status
    const { count: activeProductsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'active');

    const nextStatus = (activeProductsCount && activeProductsCount > 0) ? 'preference_pending' : 'accepted';

    const { data: campaignCreator, error } = await supabase
      .from('campaign_creators')
      .update({
        status: nextStatus,
        agreed_rate,
        brand_rate,
        accepted_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      })
      .eq('id', ccId)
      .eq('campaign_id', campaignId)
      .select('*, creators(email), campaigns(name)')
      .single();

    if (error || !campaignCreator) {
      return NextResponse.json({ success: false, error: 'Failed to approve creator' }, { status: 500 });
    }

    await logActivity({
      campaignId,
      actorType: 'admin',
      actorId: admin.id,
      actorName: admin.name,
      action: `Approved creator: ${campaignCreator.creator_name}`,
      entityType: 'campaign_creator',
      entityId: ccId,
    });

    const email = campaignCreator.creators?.email;
    const campaignName = campaignCreator.campaigns?.name || 'Campaign';

    if (email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const portalUrl = `${appUrl}/creator/campaign/${campaignId}`;
      await sendEmail({ to: email, subject: `You've been added to ${campaignName}`, html: creatorAddedToCampaign(campaignCreator.creator_name, campaignName, portalUrl) });
    }

    return NextResponse.json({ success: true, data: { campaignCreator } });

  } catch (err) {
    console.error('[ADMIN APPROVE CREATOR ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
