import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Delete in order of foreign key dependencies
    // 1. Delete activity logs
    const { error: activityError } = await supabase
      .from('activity_log')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (activityError) {
      console.error('[CLEANUP ACTIVITY ERROR]', activityError);
      return NextResponse.json({ success: false, error: 'Failed to delete activity logs' }, { status: 500 });
    }

    // 2. Delete content submissions
    const { error: submissionsError } = await supabase
      .from('content_submissions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (submissionsError) {
      console.error('[CLEANUP SUBMISSIONS ERROR]', submissionsError);
      return NextResponse.json({ success: false, error: 'Failed to delete submissions' }, { status: 500 });
    }

    // 3. Delete products
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (productsError) {
      console.error('[CLEANUP PRODUCTS ERROR]', productsError);
      return NextResponse.json({ success: false, error: 'Failed to delete products' }, { status: 500 });
    }

    // 4. Delete campaign creators
    const { error: creatorsError } = await supabase
      .from('campaign_creators')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (creatorsError) {
      console.error('[CLEANUP CREATORS ERROR]', creatorsError);
      return NextResponse.json({ success: false, error: 'Failed to delete campaign creators' }, { status: 500 });
    }

    // 5. Delete campaigns
    const { error: campaignsError } = await supabase
      .from('campaigns')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (campaignsError) {
      console.error('[CLEANUP CAMPAIGNS ERROR]', campaignsError);
      return NextResponse.json({ success: false, error: 'Failed to delete campaigns' }, { status: 500 });
    }

    // 6. Delete access codes
    const { error: codesError } = await supabase
      .from('access_codes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (codesError) {
      console.error('[CLEANUP CODES ERROR]', codesError);
      return NextResponse.json({ success: false, error: 'Failed to delete access codes' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'All test data has been successfully deleted. Database is clean for testing.'
    });

  } catch (err) {
    console.error('[CLEANUP ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred during cleanup' }, { status: 500 });
  }
}
