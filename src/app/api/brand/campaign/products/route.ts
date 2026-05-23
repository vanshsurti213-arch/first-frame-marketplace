import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";
import { productFormSchema } from "@/lib/validators/brand";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  try {
    const session = await validateBrandSession(req);
    if (!session || !session.campaignId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        creator_preferences (count)
      `)
      .eq('campaign_id', session.campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { products: products || [] } });

  } catch (err) {
    console.error('[BRAND PRODUCTS GET ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await validateBrandSession(req);
    if (!session || !session.campaignId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = productFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, product_url, variants, assigned_creator_ids } = parsed.data;
    const supabase = createServiceRoleClient();

    // Verify all creators belong to this campaign
    if (assigned_creator_ids && assigned_creator_ids.length > 0) {
      const { data: campaignCreators } = await supabase
        .from('campaign_creators')
        .select('creator_id')
        .eq('campaign_id', session.campaignId)
        .in('creator_id', assigned_creator_ids);

      const validIds = new Set((campaignCreators || []).map((c: any) => c.creator_id));
      for (const id of assigned_creator_ids) {
         if (!validIds.has(id)) {
            return NextResponse.json({ success: false, error: `Creator ${id} is not in this campaign` }, { status: 400 });
         }
      }
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        campaign_id: session.campaignId,
        name,
        product_url,
        variants: variants || [],
        assigned_creator_ids: assigned_creator_ids || [],
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity({
      campaignId: session.campaignId,
      actorType: 'brand',
      actorId: session.brandId,
      actorName: session.companyName,
      action: `Created product: ${name}`,
      entityType: 'product',
      entityId: product.id,
    });

    return NextResponse.json({ success: true, data: { product } });

  } catch (err) {
    console.error('[BRAND PRODUCTS POST ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
