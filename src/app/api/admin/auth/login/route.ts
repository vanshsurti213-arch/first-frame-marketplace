import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceRoleClient } from "@/lib/supabase/server";
import { adminLoginSchema } from "@/lib/validators/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const authSupabase = await createServerSupabase();

    const { data: authData, error: authError } = await authSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();
    const { data: adminRecord, error: adminError } = await supabase
      .from('admins')
      .select('id, email, name')
      .eq('id', authData.user.id)
      .single();

    if (adminError || !adminRecord) {
      await authSupabase.auth.signOut();
      return NextResponse.json({ success: false, error: 'User is not an administrator' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: { admin: adminRecord } });

  } catch (err) {
    console.error('[ADMIN LOGIN ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authSupabase = await createServerSupabase();
    const { data: authData } = await authSupabase.auth.getUser();

    if (!authData?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('id, email, name')
      .eq('id', authData.user.id)
      .single();

    if (!adminRecord) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: { admin: adminRecord } });
  } catch (err) {
    console.error('[ADMIN GET ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
