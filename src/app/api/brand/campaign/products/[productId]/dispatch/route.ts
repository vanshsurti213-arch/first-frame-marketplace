import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBrandSession } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/resend";
import { productDispatched } from "@/lib/email/templates";
import { z } from "zod";

const brandDispatchSchema = z.object({
  tracking_link: z.string().url().optional().or(z.literal('')),
  creator_ids: z.array(z.string()).min(1)
});

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
    const body = await req.json();
    
    const parsed = brandDispatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { tracking_link, creator_ids } = parsed.data;
    const supabase = createServiceRoleClient();

    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .eq('campaign_id', session.campaignId)
      .single();

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const { data: campaignCreators } = await supabase
      .from('campaign_creators')
      .select('id, creator_id, creator_name, creators(email)')
      .eq('campaign_id', session.campaignId)
      .in('creator_id', creator_ids);

    if (campaignCreators) {
      for (const cc of campaignCreators) {
        await supabase
          .from('campaign_creators')
          .update({
            status: 'product_dispatched',
            tracking_link: tracking_link || null,
            last_updated: new Date().toISOString()
          })
          .eq('id', cc.id);

        const email = (Array.isArray(cc.creators) ? cc.creators[0]?.email : (cc.creators as any)?.email);
        if (email) {
          await sendEmail({ to: email, subject: `Product dispatched: ${product.name}`, html: productDispatched(cc.creator_name, product.name, tracking_link || '') });
        }
      }
    }

    await logActivity({
      campaignId: session.campaignId,
      actorType: 'brand',
      actorId: session.brandId,
      actorName: session.companyName,
      action: `Dispatched product ${product.name} to ${creator_ids.length} creator(s)`,
      entityType: 'product',
      entityId: productId,
    });

    return NextResponse.json({ success: true, data: { success: true } });

  } catch (err) {
    console.error('[BRAND PRODUCT DISPATCH ERROR]', err);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
