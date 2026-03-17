export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET - Check if a superadmin already exists
 */
export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "superadmin");

    return NextResponse.json({ has_superadmin: (count ?? 0) > 0 });
  } catch (error) {
    console.error("GET /api/admin/setup error:", error);
    return NextResponse.json({ error: "Failed to check setup" }, { status: 500 });
  }
}

/**
 * POST - Promote the current user to superadmin.
 * Only works when no superadmin exists yet (first-time setup).
 */
export async function POST() {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    // Check if any superadmin already exists
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "superadmin");

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "A superadmin already exists. Use the admin panel to manage roles." },
        { status: 403 }
      );
    }

    // Promote the current user to superadmin
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ role: "superadmin" })
      .eq("id", user.id)
      .select()
      .single();

    if (error || !updatedUser) {
      return NextResponse.json({ error: "Failed to promote user" }, { status: 500 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("POST /api/admin/setup error:", error);
    return NextResponse.json({ error: "Failed to setup superadmin" }, { status: 500 });
  }
}
