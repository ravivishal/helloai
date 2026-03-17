export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    const supabase = createSupabaseAdmin();

    const { data: user, error } = await supabase
      .from("users")
      .select("*, businesses(*)")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/admin/users/[userId] error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    const body = await request.json();
    const supabase = createSupabaseAdmin();

    // Only allow updating specific fields
    const allowedFields: Record<string, unknown> = {};
    if (body.role !== undefined) allowedFields.role = body.role;
    if (body.full_name !== undefined) allowedFields.full_name = body.full_name;
    if (body.phone !== undefined) allowedFields.phone = body.phone;

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Prevent demoting yourself
    if (allowedFields.role && userId === admin.id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Only superadmins can promote to superadmin
    if (allowedFields.role === "superadmin" && admin.role !== "superadmin") {
      return NextResponse.json(
        { error: "Only a superadmin can promote to superadmin" },
        { status: 403 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .update(allowedFields)
      .eq("id", userId)
      .select()
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("PATCH /api/admin/users/[userId] error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
