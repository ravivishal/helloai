import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { updateVapiAssistant } from "@/lib/vapi/update-assistant";
import { Business } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    // Get business and verify ownership
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", params.businessId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("GET /api/businesses/[businessId] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch business" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createSupabaseAdmin();

    // Verify ownership
    const { data: existingBusiness, error: verifyError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", params.businessId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (verifyError || !existingBusiness) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Update business
    const { data: updatedBusiness, error: updateError } = await supabase
      .from("businesses")
      .update(body)
      .eq("id", params.businessId)
      .select()
      .single();

    if (updateError || !updatedBusiness) {
      throw updateError || new Error("Failed to update business");
    }

    // Check if we need to update Vapi assistant
    const fieldsToSync = [
      "services_offered",
      "business_hours",
      "faq",
      "custom_greeting",
      "custom_instructions",
      "pricing_info",
    ];
    const shouldSyncVapi = fieldsToSync.some((field) => field in body);

    if (shouldSyncVapi && updatedBusiness.vapi_assistant_id) {
      try {
        await updateVapiAssistant(updatedBusiness as Business);
      } catch (vapiError) {
        console.error("Failed to update Vapi assistant:", vapiError);
        // Don't fail the request if Vapi update fails
      }
    }

    return NextResponse.json(updatedBusiness);
  } catch (error) {
    console.error("PATCH /api/businesses/[businessId] error:", error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    // Verify ownership and soft delete
    const { error: deleteError } = await supabase
      .from("businesses")
      .update({ is_active: false })
      .eq("id", params.businessId)
      .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/businesses/[businessId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete business" },
      { status: 500 }
    );
  }
}
