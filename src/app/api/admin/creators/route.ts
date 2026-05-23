import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { creatorFormSchema } from "@/lib/validators/admin";

export async function GET(req: NextRequest) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { data: creators, error } = await supabase
      .from('creators')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch creators' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { creators: creators || [] } });

  } catch (err) {
    console.error('[ADMIN CREATORS GET ERROR]', err);
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
    const parsed = creatorFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: creator, error } = await supabase
      .from('creators')
      .insert({
         ...parsed.data,
         is_active: true
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation gracefully if needed
      if (error.code === '23505') {
         return NextResponse.json({ success: false, error: 'A creator with this email already exists' }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: 'Failed to create creator' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { creator } });

  } catch (err) {
    console.error('[ADMIN CREATORS POST ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
