export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createSupabaseAdmin();
    const { data: users, error } = await supabase
      .from("users")
      .select("*, businesses(id, business_name, twilio_phone_number, subscription_plan, is_active)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(users || []);
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
