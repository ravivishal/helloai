export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { exchangeCodeForTokens } from "@/lib/google/calendar";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL("/settings?google=error", process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings?google=error", process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Decode state
    let stateData: { businessId: string; userId: string };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return NextResponse.redirect(
        new URL("/settings?google=error", process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      console.error("No refresh token received from Google");
      return NextResponse.redirect(
        new URL("/settings?google=error", process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Store refresh token in business record
    const supabase = createSupabaseAdmin();
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        google_refresh_token: tokens.refresh_token,
        google_calendar_connected: true,
        google_calendar_id: "primary",
      })
      .eq("id", stateData.businessId)
      .eq("user_id", stateData.userId);

    if (updateError) {
      console.error("Failed to store Google tokens:", updateError);
      return NextResponse.redirect(
        new URL("/settings?google=error", process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    return NextResponse.redirect(
      new URL("/settings?google=connected", process.env.NEXT_PUBLIC_APP_URL!)
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      new URL("/settings?google=error", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}
