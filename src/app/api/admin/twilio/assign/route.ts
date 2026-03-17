export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { business_id, phone_number, phone_sid } = body;

    if (!business_id || !phone_number || !phone_sid) {
      return NextResponse.json(
        { error: "business_id, phone_number, and phone_sid are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    // Check if number is already assigned to another business
    const { data: existing } = await supabase
      .from("businesses")
      .select("id, business_name")
      .eq("twilio_phone_number", phone_number)
      .neq("id", business_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: `Number already assigned to "${existing.business_name}"` },
        { status: 409 }
      );
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .update({
        twilio_phone_number: phone_number,
        twilio_phone_sid: phone_sid,
      })
      .eq("id", business_id)
      .select()
      .single();

    if (error || !business) {
      return NextResponse.json({ error: "Failed to assign number" }, { status: 500 });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("POST /api/admin/twilio/assign error:", error);
    return NextResponse.json({ error: "Failed to assign number" }, { status: 500 });
  }
}
