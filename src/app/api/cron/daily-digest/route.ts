export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getResend } from "@/lib/resend/client";

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();
    const resend = await getResend();

    // Get start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all businesses that had calls today
    const { data: callsToday, error: callsError } = await supabase
      .from("calls")
      .select("business_id, businesses(*)")
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString())
      .eq("businesses.is_active", true);

    if (callsError) {
      throw callsError;
    }

    if (!callsToday || callsToday.length === 0) {
      return NextResponse.json({ message: "No calls today", sent: 0 });
    }

    // Group calls by business
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const businessCallsMap: Record<string, any[]> = {};
    for (const call of callsToday) {
      const businessId = call.business_id;
      if (!businessCallsMap[businessId]) {
        businessCallsMap[businessId] = [];
      }
      businessCallsMap[businessId].push(call);
    }

    let emailsSent = 0;

    // Send digest for each business
    for (const [businessId, calls] of Object.entries(businessCallsMap)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const business = (calls[0] as any).businesses;
      if (!business || !business.owner_email) {
        continue;
      }

      const callCount = calls.length;
      const urgentCalls = calls.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => c.urgency === "high" || c.urgency === "emergency"
      ).length;

      // Create summary
      const callSummaries = calls
        .slice(0, 5) // Top 5 calls
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((call: any) => {
          const urgencyEmoji =
            call.urgency === "emergency"
              ? "🚨"
              : call.urgency === "high"
                ? "🔴"
                : call.urgency === "medium"
                  ? "🟡"
                  : "🟢";

          return `
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${call.urgency === "emergency" || call.urgency === "high" ? "#EF4444" : "#3B82F6"};">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 600;">${urgencyEmoji} ${call.caller_name || "Unknown Caller"}</span>
                <span style="color: #6b7280; font-size: 14px;">${new Date(call.created_at).toLocaleTimeString()}</span>
              </div>
              <p style="margin: 0; color: #4b5563;">${call.call_summary || "No summary available"}</p>
            </div>
          `;
        })
        .join("");

      try {
        await resend.emails.send({
          from: "hello.ai <notifications@missedcall.ai>",
          to: business.owner_email,
          subject: `Daily Digest: ${callCount} call${callCount !== 1 ? "s" : ""} for ${business.business_name}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #2563EB; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Daily Call Summary</h1>
                <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">${business.business_name}</p>
              </div>

              <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                  <div style="background: white; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #2563EB;">${callCount}</div>
                    <div style="color: #6b7280; font-size: 14px;">Total Calls</div>
                  </div>
                  <div style="background: white; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #EF4444;">${urgentCalls}</div>
                    <div style="color: #6b7280; font-size: 14px;">Urgent</div>
                  </div>
                </div>

                <h2 style="font-size: 18px; margin: 0 0 16px; color: #111827;">Recent Calls</h2>
                ${callSummaries}
                ${calls.length > 5 ? `<p style="text-align: center; color: #6b7280; margin: 16px 0;">And ${calls.length - 5} more...</p>` : ""}

                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: block; background: #2563EB; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">View All Calls</a>
              </div>

              <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
                Powered by hello.ai
              </div>
            </div>
          `,
        });
        emailsSent++;
      } catch (emailError) {
        console.error(
          `Failed to send digest to ${business.owner_email}:`,
          emailError
        );
      }
    }

    return NextResponse.json({
      message: "Daily digests sent",
      businesses: businessCallsMap.size,
      sent: emailsSent,
    });
  } catch (error) {
    console.error("GET /api/cron/daily-digest error:", error);
    return NextResponse.json(
      { error: "Failed to send daily digests" },
      { status: 500 }
    );
  }
}
