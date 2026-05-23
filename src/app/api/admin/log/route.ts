import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { ACTIVITY_LOG_PAGE_SIZE } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const campaignId = url.searchParams.get("campaignId");
    const actorType = url.searchParams.get("actorType");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || String(ACTIVITY_LOG_PAGE_SIZE), 10);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = createServiceRoleClient();

    let query = supabase
      .from('activity_log')
      .select('*', { count: 'exact' });

    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (actorType) query = query.eq('actor_type', actorType);

    const { data: entries, count, error } = await query
      .order('timestamp', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[ADMIN LOG ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch activity log' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        entries: entries || [], 
        total: count || 0,
        page 
      } 
    });

  } catch (err) {
    console.error('[ADMIN LOG ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
