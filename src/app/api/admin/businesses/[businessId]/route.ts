export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { businessId } = await params;
    const supabase = createSupabaseAdmin();

    const { data: business, error } = await supabase
      .from("businesses")
      .select("*, users!inner(id, email, full_name)")
      .eq("id", businessId)
      .single();

    if (error || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("GET /api/admin/businesses/[businessId] error:", error);
    return NextResponse.json({ error: "Failed to fetch business" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { businessId } = await params;
    const body = await request.json();
    const supabase = createSupabaseAdmin();

    // Allow updating key business fields
    const allowedFields: Record<string, unknown> = {};
    const editable = [
      "business_name", "business_category", "owner_name", "owner_phone",
      "owner_email", "subscription_plan", "subscription_status",
      "calls_limit", "calls_used_this_month", "is_active", "setup_completed",
    ];

    for (const field of editable) {
      if (body[field] !== undefined) {
        allowedFields[field] = body[field];
      }
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .update(allowedFields)
      .eq("id", businessId)
      .select()
      .single();

    if (error || !business) {
      return NextResponse.json({ error: "Failed to update business" }, { status: 500 });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("PATCH /api/admin/businesses/[businessId] error:", error);
    return NextResponse.json({ error: "Failed to update business" }, { status: 500 });
  }
}
