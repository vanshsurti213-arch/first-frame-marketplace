import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateCreatorSession } from "@/lib/auth-helpers";

export async function GET(req: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const session = await validateCreatorSession(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = params;
    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'Campaign ID is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Verify creator is in this campaign
    const { data: creatorRecord, error: creatorError } = await supabase
      .from('campaign_creators')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.creatorId)
      .single();

    if (creatorError || !creatorRecord) {
      return NextResponse.json({ success: false, error: 'Not part of this campaign' }, { status: 403 });
    }

    // Get Campaign details
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    // Get assigned products
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('campaign_id', campaignId)
      .contains('assigned_creator_ids', [session.creatorId]);

    // Get preferences
    const { data: preferences } = await supabase
      .from('creator_preferences')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.creatorId);

    // Get submissions
    const { data: submissions } = await supabase
      .from('content_submissions')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.creatorId);

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        creatorRecord,
        products: products || [],
        preferences: preferences || [],
        submissions: submissions || []
      }
    });

  } catch (err) {
    console.error('[CREATOR CAMPAIGN DETAIL ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
