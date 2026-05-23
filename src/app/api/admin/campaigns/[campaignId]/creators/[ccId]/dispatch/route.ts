import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/resend";
import { productDispatched } from "@/lib/email/templates";
import { z } from "zod";

const dispatchSchema = z.object({
  tracking_link: z.string().url().optional().or(z.literal(''))
});

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
    
    const parsed = dispatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const tracking_link = parsed.data.tracking_link || null;
    const supabase = createServiceRoleClient();

    const { data: campaignCreator, error } = await supabase
      .from('campaign_creators')
      .update({
        status: 'product_dispatched',
        tracking_link,
        last_updated: new Date().toISOString()
      })
      .eq('id', ccId)
      .eq('campaign_id', campaignId)
      .select('*, creators(email), campaigns(name)')
      .single();

    if (error || !campaignCreator) {
      return NextResponse.json({ success: false, error: 'Failed to dispatch product' }, { status: 500 });
    }

    await logActivity({
      campaignId,
      actorType: 'admin',
      actorId: admin.id,
      actorName: admin.name,
      action: `Dispatched product to creator: ${campaignCreator.creator_name}`,
      entityType: 'campaign_creator',
      entityId: ccId,
    });

    const email = campaignCreator.creators?.email;
    const campaignName = campaignCreator.campaigns?.name || 'Campaign Product';

    if (email) {
      await sendEmail({ to: email, subject: `Product Dispatched`, html: productDispatched(campaignCreator.creator_name, campaignName, tracking_link || '') });
    }

    return NextResponse.json({ success: true, data: { campaignCreator } });

  } catch (err) {
    console.error('[ADMIN DISPATCH CREATOR ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
