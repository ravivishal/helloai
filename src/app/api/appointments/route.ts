export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const supabase = createSupabaseAdmin();

    // Get user's businesses
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (!businesses || businesses.length === 0) {
      return NextResponse.json([]);
    }

    const businessIds = businesses.map((b) => b.id);

    let query = supabase
      .from("appointments")
      .select("*", { count: "exact" })
      .in("business_id", businessIds)
      .order("appointment_date", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: appointments, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      appointments: appointments || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}
