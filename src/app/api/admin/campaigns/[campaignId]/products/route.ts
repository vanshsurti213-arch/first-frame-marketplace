import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { productFormSchema } from "@/lib/validators/brand";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = params;
    const supabase = createServiceRoleClient();

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        creator_preferences (count)
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { products: products || [] } });

  } catch (err) {
    console.error('[ADMIN PRODUCTS GET ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = params;
    const body = await req.json();
    const parsed = productFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, product_url, variants, assigned_creator_ids } = parsed.data;
    const supabase = createServiceRoleClient();

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        campaign_id: campaignId,
        name,
        product_url,
        variants: variants || [],
        assigned_creator_ids: assigned_creator_ids || [],
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('[ADMIN PRODUCTS POST ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
    }

    await logActivity({
      campaignId,
      actorType: 'admin',
      actorId: admin.id,
      actorName: admin.name,
      action: `Created product: ${name}`,
      entityType: 'product',
      entityId: product.id,
    });

    return NextResponse.json({ success: true, data: { product } });

  } catch (err) {
    console.error('[ADMIN PRODUCTS POST ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
