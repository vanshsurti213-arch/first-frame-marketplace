import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";

export async function GET(req: NextRequest, { params }: { params: { creatorId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const supabase = createServiceRoleClient();
    const { data: creator, error } = await supabase
      .from('creators')
      .select('*')
      .eq('id', params.creatorId)
      .single();

    if (error || !creator) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { creator } });
  } catch (err) {
    console.error('[ADMIN CREATOR GET ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { creatorId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const supabase = createServiceRoleClient();
    
    const { data: creator, error } = await supabase
      .from('creators')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.creatorId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to update creator' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { creator } });
  } catch (err) {
    console.error('[ADMIN CREATOR PATCH ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { creatorId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const supabase = createServiceRoleClient();
    
    const { error } = await supabase
      .from('creators')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', params.creatorId);

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to delete creator' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (err) {
    console.error('[ADMIN CREATOR DELETE ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
