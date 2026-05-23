import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'video' | 'thumbnail';
    const creatorId = formData.get('creatorId') as string;

    if (!file || !type || !creatorId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const bucket = type === 'video' ? 'creator-videos' : 'creator-thumbnails';
    const timestamp = Date.now();
    const filename = `${creatorId}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const supabase = createServiceRoleClient();
    
    // Supabase JS storage client requires ArrayBuffer or Blob
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, arrayBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('[ADMIN UPLOAD ERROR]', error);
      return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    const url = publicUrlData.publicUrl;

    // Optional: auto-update the creator record
    const updateField = type === 'video' ? 'best_video_url' : 'thumbnail_url';
    await supabase
      .from('creators')
      .update({ [updateField]: url, updated_at: new Date().toISOString() })
      .eq('id', creatorId);

    return NextResponse.json({ success: true, data: { url } });

  } catch (err) {
    console.error('[ADMIN UPLOAD ROUTE ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
