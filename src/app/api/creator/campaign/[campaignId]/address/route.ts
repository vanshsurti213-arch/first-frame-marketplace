import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateCreatorSession } from "@/lib/auth-helpers";
import { shippingAddressSchema } from "@/lib/validators/creator";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const session = await validateCreatorSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = params;
    const body = await req.json();

    const parsed = shippingAddressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { address } = parsed.data;

    const supabase = createServiceRoleClient();

    // Verify creator is in this campaign
    const { data: creatorRecord, error: creatorError } = await supabase
      .from('campaign_creators')
      .select('id, status')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.creatorId)
      .single();

    if (creatorError || !creatorRecord) {
      return NextResponse.json({ success: false, error: 'Not part of this campaign' }, { status: 403 });
    }

    let nextStatus = creatorRecord.status;
    if (creatorRecord.status === 'preference_pending') {
       nextStatus = 'preference_submitted'; // Could check if preference is actually submitted
    }

    const { error: updateError } = await supabase
      .from('campaign_creators')
      .update({
        shipping_address: address,
        status: nextStatus,
        last_updated: new Date().toISOString()
      })
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.creatorId);

    if (updateError) {
      console.error('[CREATOR ADDRESS UPDATE ERROR]', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update address' }, { status: 500 });
    }

    await logActivity({
      campaignId,
      actorType: 'creator',
      actorId: session.creatorId,
      actorName: session.creatorName,
      action: 'Updated shipping address',
      entityType: 'campaign_creator',
      entityId: creatorRecord.id,
    });

    return NextResponse.json({ success: true, data: { success: true } });

  } catch (err) {
    console.error('[CREATOR ADDRESS ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
