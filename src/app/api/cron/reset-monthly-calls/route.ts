export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    // Get all active businesses where billing cycle needs reset
    const today = new Date();
    const { data: businesses, error: fetchError } = await supabase
      .from("businesses")
      .select("id, billing_cycle_start")
      .eq("is_active", true);

    if (fetchError) {
      throw fetchError;
    }

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({
        message: "No businesses to reset",
        updated: 0,
      });
    }

    // Filter businesses that need reset (30+ days since last cycle)
    const businessesToReset = businesses.filter((business) => {
      const cycleStart = new Date(business.billing_cycle_start);
      const daysSince =
        (today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= 30;
    });

    if (businessesToReset.length === 0) {
      return NextResponse.json({
        message: "No businesses ready for reset",
        updated: 0,
      });
    }

    // Reset calls_used_this_month and update billing_cycle_start
    const businessIds = businessesToReset.map((b) => b.id);
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        calls_used_this_month: 0,
        billing_cycle_start: today.toISOString(),
      })
      .in("id", businessIds);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      message: "Monthly calls reset",
      updated: businessesToReset.length,
    });
  } catch (error) {
    console.error("GET /api/cron/reset-monthly-calls error:", error);
    return NextResponse.json(
      { error: "Failed to reset monthly calls" },
      { status: 500 }
    );
  }
}
