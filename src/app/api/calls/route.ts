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

    const supabase = createSupabaseAdmin();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const urgency = searchParams.get("urgency");
    const outcome = searchParams.get("outcome");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Get user's businesses
    const { data: businesses, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (businessError || !businesses || businesses.length === 0) {
      return NextResponse.json({
        calls: [],
        total: 0,
        page,
        totalPages: 0,
      });
    }

    const businessIds = businesses.map((b) => b.id);

    // Build query
    let query = supabase
      .from("calls")
      .select("*", { count: "exact" })
      .in("business_id", businessIds)
      .order("created_at", { ascending: false });

    // Apply filters
    if (urgency) {
      query = query.eq("urgency", urgency);
    }
    if (outcome) {
      query = query.eq("call_outcome", outcome);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: calls, error: callsError, count } = await query;

    if (callsError) {
      throw callsError;
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      calls: calls || [],
      total: count || 0,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("GET /api/calls error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}
