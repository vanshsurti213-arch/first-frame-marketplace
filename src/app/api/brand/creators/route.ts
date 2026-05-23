import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";
import { sanitizeCreator } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await validateBrandSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const niche = url.searchParams.get("niche");
    const city = url.searchParams.get("city");

    const supabase = createServiceRoleClient();

    let query = supabase
      .from('creators')
      .select('*')
      .eq('is_active', true);

    if (niche) query = query.eq('niche', niche);
    if (city) query = query.ilike('city', `%${city}%`);

    const { data: creatorsData, error } = await query;

    if (error) {
      console.error('[BRAND CREATORS ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch creators' }, { status: 500 });
    }

    let creatorsWithStatus = [];

    if (session.campaignId && creatorsData && creatorsData.length > 0) {
       const creatorIds = creatorsData.map((c: any) => c.id);
       
       const { data: campaignCreators } = await supabase
         .from('campaign_creators')
         .select('creator_id, status')
         .eq('campaign_id', session.campaignId)
         .in('creator_id', creatorIds);

       const statusMap = new Map();
       if (campaignCreators) {
         campaignCreators.forEach((cc: any) => {
            statusMap.set(cc.creator_id, cc.status);
         });
       }

       creatorsWithStatus = creatorsData.map((c: any) => {
         const sanitized = sanitizeCreator(c);
         return {
           ...sanitized,
           campaignStatus: statusMap.get(c.id) || null
         };
       });
    } else {
       creatorsWithStatus = (creatorsData || []).map((c: any) => sanitizeCreator(c));
    }

    return NextResponse.json({ success: true, data: { creators: creatorsWithStatus } });

  } catch (err) {
    console.error('[BRAND CREATORS ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
