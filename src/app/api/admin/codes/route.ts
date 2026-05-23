import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { accessCodeFormSchema } from "@/lib/validators/admin";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { data: codes, error } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch access codes' }, { status: 500 });
    }

    const maskedCodes = (codes || []).map((c: any) => {
      // Mask the code e.g. AB12CD34 -> AB****34
      const masked = c.code.substring(0, 2) + '****' + c.code.substring(c.code.length - 2);
      return { ...c, code: masked };
    });

    return NextResponse.json({ success: true, data: { codes: maskedCodes } });

  } catch (err) {
    console.error('[ADMIN CODES GET ERROR]', err);
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
    const parsed = accessCodeFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    // Generate 8-char uppercase alphanumeric code
    const rawCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const supabase = createServiceRoleClient();

    const { data: accessCode, error } = await supabase
      .from('access_codes')
      .insert({
         ...parsed.data,
         code: rawCode,
         created_by: admin.id,
         is_used: false
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to create access code' }, { status: 500 });
    }

    // Return the full code only once upon creation
    return NextResponse.json({ success: true, data: { code: rawCode, accessCode } });

  } catch (err) {
    console.error('[ADMIN CODES POST ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
