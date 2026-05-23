import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateCreatorSession } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";

export async function POST(
  req: NextRequest,
  { params }: { params: { campaignId: string; productId: string } }
) {
  try {
    const session = await validateCreatorSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, productId } = params;
    const supabase = createServiceRoleClient();

    // Verify creator is assigned to this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('assigned_creator_ids, script_version, name')
      .eq('id', productId)
      .single();

    if (productError || !product || !product.assigned_creator_ids?.includes(session.creatorId)) {
      return NextResponse.json({ success: false, error: 'Not assigned to this product' }, { status: 403 });
    }

    // Acknowledge brief
    const { data: ccData } = await supabase
      .from('campaign_creators')
      .select('id, notes')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.creatorId)
      .single();

    if (ccData) {
      const note = `\nAcknowledged ${product.name} brief v${product.script_version || 1} at ${new Date().toISOString()}`;
      const updatedNotes = (ccData.notes || '') + note;

      await supabase
        .from('campaign_creators')
        .update({ notes: updatedNotes })
        .eq('id', ccData.id);
    }

    await logActivity({
      campaignId,
      actorType: 'creator',
      actorId: session.creatorId,
      actorName: session.creatorName,
      action: `Acknowledged brief for ${product.name}`,
      entityType: 'product',
      entityId: productId,
    });

    return NextResponse.json({ success: true, data: { success: true } });

  } catch (err) {
    console.error('[CREATOR ACKNOWLEDGE ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
