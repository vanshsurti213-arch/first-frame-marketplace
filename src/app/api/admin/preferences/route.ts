import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const campaignId = url.searchParams.get("campaignId");

    const supabase = createServiceRoleClient();

    let query = supabase
      .from('creator_preferences')
      .select(`
        *,
        products (name),
        campaign_creators!inner (shipping_address)
      `);

    if (campaignId) {
      query = query.eq('campaign_id', campaignId).eq('campaign_creators.campaign_id', campaignId);
    }

    const { data: preferencesData, error } = await query;

    if (error) {
      console.error('[ADMIN PREFERENCES ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch preferences' }, { status: 500 });
    }

    let preferences = preferencesData || [];
    
    preferences = preferences.map((p: any) => {
        let shippingAddress = null;
        if (Array.isArray(p.campaign_creators) && p.campaign_creators.length > 0) {
            shippingAddress = p.campaign_creators[0].shipping_address;
        } else if (p.campaign_creators) {
            shippingAddress = p.campaign_creators.shipping_address;
        }
        
        return {
            ...p,
            product_name: p.products?.name,
            shipping_address: shippingAddress,
            products: undefined,
            campaign_creators: undefined
        };
    });

    return NextResponse.json({ success: true, data: { preferences } });

  } catch (err) {
    console.error('[ADMIN PREFERENCES ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
