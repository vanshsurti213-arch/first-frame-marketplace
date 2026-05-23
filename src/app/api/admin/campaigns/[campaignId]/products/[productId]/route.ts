import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateAdminSession } from "@/lib/auth-helpers";
import { scriptFormSchema } from "@/lib/validators/brand";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/resend";
import { scriptUploaded, scriptUpdated } from "@/lib/email/templates";

export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string; productId: string } }
) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, productId } = params;
    const supabase = createServiceRoleClient();

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        creator_preferences (*)
      `)
      .eq('id', productId)
      .eq('campaign_id', campaignId)
      .single();

    if (error || !product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { product } });

  } catch (err) {
    console.error('[ADMIN PRODUCT GET ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { campaignId: string; productId: string } }
) {
  try {
    const admin = await validateAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, productId } = params;
    const body = await req.json();
    const supabase = createServiceRoleClient();

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('campaign_id', campaignId)
      .single();

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const updateData: any = { ...body, updated_at: new Date().toISOString() };
    let isScriptUpdate = false;
    let oldVersion = product.script_version || 0;

    if (body.script_content !== undefined && body.script_content !== product.script_content) {
      const parsed = scriptFormSchema.safeParse({ script_content: body.script_content });
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
      }
      isScriptUpdate = true;
      updateData.script_version = oldVersion + 1;
      updateData.script_updated_at = new Date().toISOString();
    }

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    await logActivity({
      campaignId,
      actorType: 'admin',
      actorId: admin.id,
      actorName: admin.name,
      action: isScriptUpdate ? `Updated script for product: ${updatedProduct.name}` : `Updated product: ${updatedProduct.name}`,
      entityType: 'product',
      entityId: productId,
    });

    if (isScriptUpdate && updatedProduct.assigned_creator_ids?.length > 0) {
      const { data: creatorsToNotify } = await supabase
        .from('campaign_creators')
        .select('id, creator_id, creator_name, status, creators(email)')
        .eq('campaign_id', campaignId)
        .in('creator_id', updatedProduct.assigned_creator_ids);

      if (creatorsToNotify) {
        for (const cc of creatorsToNotify) {
           const email = (Array.isArray(cc.creators) ? cc.creators[0]?.email : (cc.creators as any)?.email);
           if (!email) continue;
           
           const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
           const portalUrl = `${appUrl}/creator/campaign/${campaignId}`;

           if (oldVersion === 0) {
               await sendEmail({ to: email, subject: `Brief uploaded for ${updatedProduct.name}`, html: scriptUploaded(cc.creator_name, updatedProduct.name, portalUrl) });
           } else {
               await sendEmail({ to: email, subject: `Brief updated for ${updatedProduct.name}`, html: scriptUpdated(cc.creator_name, updatedProduct.name, updatedProduct.script_version, portalUrl) });
           }

           if (cc.status === 'product_dispatched') {
              await supabase
                .from('campaign_creators')
                .update({ status: 'brief_received', last_updated: new Date().toISOString() })
                .eq('id', cc.id);
           }
        }
      }
    }

    return NextResponse.json({ success: true, data: { product: updatedProduct } });

  } catch (err) {
    console.error('[ADMIN PRODUCT PATCH ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
