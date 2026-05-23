import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, accessCode } = body;

    if (!companyName || !accessCode) {
      return NextResponse.json(
        { success: false, error: "Company name and access code are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Find the access code
    const { data: codeData, error: codeError } = await supabase
      .from("access_codes")
      .select("*")
      .eq("code", accessCode.trim().toUpperCase())
      .single();

    if (codeError || !codeData) {
      return NextResponse.json(
        { success: false, error: "Invalid access code" },
        { status: 401 }
      );
    }

    // Check expiry
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "This access code has expired" },
        { status: 401 }
      );
    }

    // Check if used by another company
    if (codeData.is_used) {
      if (codeData.brand_company_name.toLowerCase() !== companyName.trim().toLowerCase()) {
        return NextResponse.json(
          { success: false, error: "Company name does not match the one associated with this code" },
          { status: 401 }
        );
      }
    } else {
      // First use — mark as used
      await supabase
        .from("access_codes")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("id", codeData.id);
    }

    // Find or create brand
    let brandId = "";
    let campaignId = "";

    const { data: existingBrand } = await supabase
      .from("brands")
      .select("id, campaign_id")
      .eq("email", codeData.brand_email)
      .single();

    if (existingBrand) {
      brandId = existingBrand.id;
      campaignId = existingBrand.campaign_id || "";
    } else {
      // Create brand
      const { data: newBrand, error: brandError } = await supabase
        .from("brands")
        .insert({
          company_name: codeData.brand_company_name,
          email: codeData.brand_email,
        })
        .select()
        .single();

      if (brandError || !newBrand) {
        return NextResponse.json(
          { success: false, error: "Failed to create brand profile" },
          { status: 500 }
        );
      }

      brandId = newBrand.id;

      // Create campaign for brand
      const { data: newCampaign, error: campError } = await supabase
        .from("campaigns")
        .insert({
          brand_id: newBrand.id,
          brand_name: codeData.brand_company_name,
          name: `${codeData.brand_company_name} Campaign`,
          status: "active",
        })
        .select()
        .single();

      if (newCampaign) {
        campaignId = newCampaign.id;
        // Update brand with campaign_id
        await supabase
          .from("brands")
          .update({ campaign_id: newCampaign.id })
          .eq("id", newBrand.id);
      }
    }

    // If we still don't have a campaignId, try to find it or auto-create one
    if (!campaignId) {
      const { data: campaignData } = await supabase
        .from("campaigns")
        .select("id")
        .eq("brand_id", brandId)
        .eq("status", "active")
        .maybeSingle();

      if (campaignData) {
        campaignId = campaignData.id;
        // Update brand with campaign_id
        await supabase
          .from("brands")
          .update({ campaign_id: campaignId })
          .eq("id", brandId);
      } else {
        // Create campaign for brand
        const { data: newCampaign } = await supabase
          .from("campaigns")
          .insert({
            brand_id: brandId,
            brand_name: codeData.brand_company_name,
            name: `${codeData.brand_company_name} Campaign`,
            status: "active",
          })
          .select()
          .single();

        if (newCampaign) {
          campaignId = newCampaign.id;
          // Update brand with campaign_id
          await supabase
            .from("brands")
            .update({ campaign_id: newCampaign.id })
            .eq("id", brandId);
        }
      }
    }

    const session = {
      brandId,
      companyName: codeData.brand_company_name,
      campaignId,
    };

    return NextResponse.json({ success: true, data: session });
  } catch (err) {
    console.error("Brand auth error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
