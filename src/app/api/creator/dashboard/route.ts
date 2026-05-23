import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateCreatorSession } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await validateCreatorSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { data: campaignsData, error } = await supabase
      .from('campaign_creators')
      .select(`
        *,
        campaigns (
          name,
          brand_name,
          status
        )
      `)
      .eq('creator_id', session.creatorId);

    if (error) {
      console.error('[CREATOR DASHBOARD DB ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { campaigns: campaignsData } });
  } catch (err) {
    console.error('[CREATOR DASHBOARD ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
