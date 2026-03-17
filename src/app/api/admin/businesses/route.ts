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
    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("*, users!inner(id, email, full_name)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(businesses || []);
  } catch (error) {
    console.error("GET /api/admin/businesses error:", error);
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
  }
}
