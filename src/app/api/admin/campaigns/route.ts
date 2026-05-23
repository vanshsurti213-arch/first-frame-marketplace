import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";
import { z } from "zod";

const campaignFormSchema = z.object({
  brand_id: z.string().uuid().optional(),
  brand_name: z.string().min(2),
  name: z.string().min(2),
  collab_type: z.string().optional(),
  ad_rights_duration: z.string().optional(),
  brand_size: z.string().optional(),
  creator_kind: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_creators (count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { campaigns: campaigns || [] } });

  } catch (err) {
    console.error('[ADMIN CAMPAIGNS GET ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = campaignFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const payload = parsed.data;

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
         ...payload,
         status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('[ADMIN CAMPAIGN CREATE ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
    }

    // Optionally update brand's campaign_id if brand_id was provided
    if (payload.brand_id) {
       await supabase
         .from('brands')
         .update({ campaign_id: campaign.id })
         .eq('id', payload.brand_id);
    }

    await logActivity({
      campaignId: campaign.id,
      actorType: 'admin',
      actorId: admin.id,
      actorName: admin.name,
      action: `Created campaign: ${campaign.name}`,
      entityType: 'campaign',
      entityId: campaign.id,
    });

    return NextResponse.json({ success: true, data: { campaign } });

  } catch (err) {
    console.error('[ADMIN CAMPAIGNS POST ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
