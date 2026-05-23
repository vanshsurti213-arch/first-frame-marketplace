import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";

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
    const supabase = createServiceRoleClient();

    const { data: campaignCreator, error } = await supabase
      .from('campaign_creators')
      .update({
        status: 'rejected',
        last_updated: new Date().toISOString()
      })
      .eq('id', ccId)
      .eq('campaign_id', campaignId)
      .select('creator_name')
      .single();

    if (error || !campaignCreator) {
      return NextResponse.json({ success: false, error: 'Failed to reject creator' }, { status: 500 });
    }

    await logActivity({
      campaignId,
      actorType: 'admin',
      actorId: admin.id,
      actorName: admin.name,
      action: `Rejected creator: ${campaignCreator.creator_name}`,
      entityType: 'campaign_creator',
      entityId: ccId,
    });

    return NextResponse.json({ success: true, data: { success: true } });

  } catch (err) {
    console.error('[ADMIN REJECT CREATOR ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
