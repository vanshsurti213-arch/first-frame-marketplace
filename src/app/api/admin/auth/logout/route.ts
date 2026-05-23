import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ADMIN LOGOUT ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
