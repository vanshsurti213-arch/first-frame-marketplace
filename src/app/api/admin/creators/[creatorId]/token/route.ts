import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { sendEmail } from "@/lib/email/resend";
import { creatorMagicLink } from "@/lib/email/templates";
import crypto from "crypto";

export async function POST(req: NextRequest, { params }: { params: { creatorId: string } }) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { creatorId } = params;
    const supabase = createServiceRoleClient();

    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('name, email')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    const token = crypto.randomUUID();

    const { error: insertError } = await supabase
      .from('creator_tokens')
      .insert({
        creator_id: creatorId,
        token,
        is_revoked: false
      });

    if (insertError) {
      console.error('[ADMIN TOKEN GENERATION ERROR]', insertError);
      return NextResponse.json({ success: false, error: 'Failed to generate token' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const magicLinkUrl = `${appUrl}/creator/join?token=${token}`;

    if (creator.email) {
      await sendEmail({ to: creator.email, subject: 'Your Firstframe Creator Magic Link', html: creatorMagicLink(creator.name, magicLinkUrl) });
    }

    return NextResponse.json({ 
      success: true, 
      data: { token, magicLink: magicLinkUrl } 
    });

  } catch (err) {
    console.error('[ADMIN TOKEN ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
