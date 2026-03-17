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

    const [usersRes, businessesRes, callsRes, activeSubsRes] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("businesses").select("id", { count: "exact", head: true }),
      supabase.from("calls").select("id", { count: "exact", head: true }),
      supabase
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .neq("subscription_plan", "free")
        .eq("subscription_status", "active"),
    ]);

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentSignups } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    // Calls this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: callsThisMonth } = await supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    return NextResponse.json({
      total_users: usersRes.count || 0,
      total_businesses: businessesRes.count || 0,
      total_calls: callsRes.count || 0,
      active_paid_subscriptions: activeSubsRes.count || 0,
      recent_signups_7d: recentSignups || 0,
      calls_this_month: callsThisMonth || 0,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
