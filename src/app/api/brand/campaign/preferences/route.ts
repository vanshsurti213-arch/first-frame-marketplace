import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await validateBrandSession(req);
    if (!session || !session.campaignId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { data: preferencesData, error } = await supabase
      .from('creator_preferences')
      .select(`
        *,
        products (name),
        campaign_creators!inner (shipping_address)
      `)
      .eq('campaign_id', session.campaignId)
      .eq('campaign_creators.campaign_id', session.campaignId); // Ensure we join on the right campaign

    if (error) {
      console.error('[BRAND PREFERENCES ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // Process data to group by product and extract shipping address properly
    // Note: PostgREST joins might require careful handling if relationships are complex
    // For MVP, we'll map the raw data directly. If campaign_creators join fails, we could do a secondary query.
    
    let preferences = preferencesData || [];
    
    // In Supabase, the !inner join above might return an array for campaign_creators depending on the foreign keys.
    // If it's an array, we take the first element.
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
    console.error('[BRAND PREFERENCES ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
