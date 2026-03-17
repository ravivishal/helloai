export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getTwilioClient } from "@/lib/twilio/client";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createSupabaseAdmin();

    // Get all businesses that have Twilio numbers assigned
    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("id, business_name, twilio_phone_number, twilio_phone_sid, is_active, subscription_plan, users!inner(id, email, full_name)")
      .not("twilio_phone_number", "is", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Also get all numbers from Twilio account to find unassigned ones
    let twilioNumbers: { phoneNumber: string; sid: string; friendlyName: string }[] = [];
    try {
      const client = await getTwilioClient();
      const numbers = await client.incomingPhoneNumbers.list({ limit: 100 });
      twilioNumbers = numbers.map((n: { phoneNumber: string; sid: string; friendlyName: string }) => ({
        phoneNumber: n.phoneNumber,
        sid: n.sid,
        friendlyName: n.friendlyName,
      }));
    } catch {
      // Twilio may not be configured; continue with DB data only
    }

    const assignedSids = new Set(
      (businesses || []).map((b) => b.twilio_phone_sid).filter(Boolean)
    );

    const unassigned = twilioNumbers.filter((n) => !assignedSids.has(n.sid));

    return NextResponse.json({
      assigned: businesses || [],
      unassigned,
      total_twilio: twilioNumbers.length,
    });
  } catch (error) {
    console.error("GET /api/admin/twilio/numbers error:", error);
    return NextResponse.json({ error: "Failed to fetch numbers" }, { status: 500 });
  }
}
