import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateCreatorSession } from "@/lib/auth-helpers";
import { preferenceSchema } from "@/lib/validators/creator";
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
    const body = await req.json();

    const parsed = preferenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { selectedVariantId } = parsed.data;
    const supabase = createServiceRoleClient();

    // Verify creator is assigned to this product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('assigned_creator_ids, variants')
      .eq('id', productId)
      .single();

    if (productError || !product || !product.assigned_creator_ids?.includes(session.creatorId)) {
      return NextResponse.json({ success: false, error: 'Not assigned to this product' }, { status: 403 });
    }

    // Find the label for the selected variant
    const variants = (product.variants as any[]) || [];
    const variant = variants.find(v => v.id === selectedVariantId);
    const selectedVariantLabel = variant ? variant.name : selectedVariantId;

    // Upsert preference
    const { error: upsertError } = await supabase
      .from('creator_preferences')
      .upsert({
        campaign_id: campaignId,
        creator_id: session.creatorId,
        creator_name: session.creatorName,
        product_id: productId,
        selected_variant_id: selectedVariantId,
        selected_variant_label: selectedVariantLabel
      }, { onConflict: 'creator_id,product_id' });

    if (upsertError) {
      console.error('[PREFERENCE UPSERT ERROR]', upsertError);
      return NextResponse.json({ success: false, error: 'Failed to save preference' }, { status: 500 });
    }

    // Update status if needed
    const { data: ccData } = await supabase
      .from('campaign_creators')
      .select('id, shipping_address, status')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.creatorId)
      .single();

    if (ccData && ccData.status === 'preference_pending' && ccData.shipping_address) {
      await supabase
        .from('campaign_creators')
        .update({ status: 'preference_submitted', last_updated: new Date().toISOString() })
        .eq('id', ccData.id);
    }

    await logActivity({
      campaignId,
      actorType: 'creator',
      actorId: session.creatorId,
      actorName: session.creatorName,
      action: `Submitted product preference: ${selectedVariantLabel}`,
      entityType: 'product',
      entityId: productId,
    });

    return NextResponse.json({ success: true, data: { success: true } });

  } catch (err) {
    console.error('[CREATOR PREFERENCE ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
