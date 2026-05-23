import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Look up token
    const { data: tokenData, error: tokenError } = await supabase
      .from("creator_tokens")
      .select("*, creators(id, name)")
      .eq("token", token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: "This link is invalid or has expired" },
        { status: 401 }
      );
    }

    // Set used_at if first use (non-blocking for V1)
    if (!tokenData.used_at) {
      await supabase
        .from("creator_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", tokenData.id);
    }

    const creator = tokenData.creators as { id: string; name: string } | null;
    if (!creator) {
      return NextResponse.json(
        { success: false, error: "Creator not found for this token" },
        { status: 404 }
      );
    }

    const session = {
      creatorId: creator.id,
      creatorName: creator.name,
    };

    return NextResponse.json({ success: true, data: session });
  } catch (err) {
    console.error("Creator auth error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
