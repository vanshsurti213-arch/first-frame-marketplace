import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";

export async function POST(req: NextRequest, { params }: { params: { codeId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { codeId } = params;
    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from('access_codes')
      .update({ expires_at: new Date().toISOString() })
      .eq('id', codeId);

    if (error) {
      console.error('[ADMIN REVOKE CODE ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to revoke access code' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { success: true } });

  } catch (err) {
    console.error('[ADMIN REVOKE CODE ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
