import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";
import { sanitizeCreator } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await validateBrandSession(req);
    if (!session || !session.campaignId) {
      return NextResponse.json({ success: false, error: 'Unauthorized or no campaign' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { data: campaignCreators, error } = await supabase
      .from('campaign_creators')
      .select(`
        *,
        creators (*)
      `)
      .eq('campaign_id', session.campaignId);

    if (error) {
      console.error('[BRAND CAMPAIGN CREATORS ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch campaign creators' }, { status: 500 });
    }

    const creators = (campaignCreators || []).map((cc: any) => {
      if (cc.creators) {
         cc.creators = sanitizeCreator(cc.creators);
      }
      return cc;
    });

    return NextResponse.json({ success: true, data: { creators } });

  } catch (err) {
    console.error('[BRAND CAMPAIGN CREATORS ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
