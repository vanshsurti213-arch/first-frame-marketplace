import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/resend";
import { productActivated } from "@/lib/email/templates";

export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await validateBrandSession(req);
    if (!session || !session.campaignId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = params;
    const supabase = createServiceRoleClient();

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('campaign_id', session.campaignId)
      .single();

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    await logActivity({
      campaignId: session.campaignId,
      actorType: 'brand',
      actorId: session.brandId,
      actorName: session.companyName,
      action: `Activated product: ${updatedProduct.name}`,
      entityType: 'product',
      entityId: productId,
    });

    if (updatedProduct.assigned_creator_ids?.length > 0) {
       const { data: campaignCreators } = await supabase
        .from('campaign_creators')
        .select('id, creator_id, creator_name, status, creators(email)')
        .eq('campaign_id', session.campaignId)
        .in('creator_id', updatedProduct.assigned_creator_ids);

       if (campaignCreators) {
         for (const cc of campaignCreators) {
            if (cc.status === 'accepted') {
               await supabase
                 .from('campaign_creators')
                 .update({ status: 'preference_pending', last_updated: new Date().toISOString() })
                 .eq('id', cc.id);
            }

            const email = (Array.isArray(cc.creators) ? cc.creators[0]?.email : (cc.creators as any)?.email);
            if (email) {
               const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
               const portalUrl = `${appUrl}/creator/campaign/${session.campaignId}`;
               await sendEmail({ to: email, subject: `You've been assigned to ${updatedProduct.name}`, html: productActivated(cc.creator_name, updatedProduct.name, portalUrl) });
            }
         }
       }
    }

    return NextResponse.json({ success: true, data: { product: updatedProduct } });

  } catch (err) {
    console.error('[BRAND PRODUCT ACTIVATE ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
