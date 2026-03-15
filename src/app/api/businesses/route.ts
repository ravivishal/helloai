export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { buyPhoneNumber } from "@/lib/twilio/buy-number";
import { createVapiAssistant } from "@/lib/vapi/create-assistant";
import { Business } from "@/types";

export async function GET() {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    // Get all businesses for this user
    const { data: businesses, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (businessError) {
      throw businessError;
    }

    return NextResponse.json(businesses || []);
  } catch (error) {
    console.error("GET /api/businesses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createSupabaseAdmin();

    // Step 1: Buy a Twilio phone number
    const { phoneNumber, sid } = await buyPhoneNumber(body.area_code);

    // Step 2: Insert business row into Supabase
    const { data: business, error: insertError } = await supabase
      .from("businesses")
      .insert({
        user_id: user.id,
        business_name: body.business_name,
        business_category: body.business_category,
        owner_name: body.owner_name,
        owner_phone: body.owner_phone,
        owner_email: body.owner_email,
        business_phone: body.business_phone,
        service_area: body.service_area,
        business_hours: body.business_hours,
        services_offered: body.services_offered,
        pricing_info: body.pricing_info,
        booking_url: body.booking_url,
        custom_greeting: body.custom_greeting,
        custom_instructions: body.custom_instructions,
        faq: body.faq || [],
        twilio_phone_number: phoneNumber,
        twilio_phone_sid: sid,
        subscription_plan: "free",
        subscription_status: "active",
        calls_used_this_month: 0,
        calls_limit: 10,
        billing_cycle_start: new Date().toISOString(),
        is_active: true,
        setup_completed: false,
      })
      .select()
      .single();

    if (insertError || !business) {
      throw insertError || new Error("Failed to create business");
    }

    // Step 3: Create Vapi assistant
    const assistant = await createVapiAssistant(business as Business);

    // Step 4: Update business with vapi_assistant_id and set setup_completed
    const { data: updatedBusiness, error: updateError } = await supabase
      .from("businesses")
      .update({
        vapi_assistant_id: assistant.id,
        setup_completed: true,
      })
      .eq("id", business.id)
      .select()
      .single();

    if (updateError || !updatedBusiness) {
      throw updateError || new Error("Failed to update business");
    }

    return NextResponse.json(updatedBusiness, { status: 201 });
  } catch (error) {
    console.error("POST /api/businesses error:", error);
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}
