export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getGoogleAuthUrl } from "@/lib/google/calendar";

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    // Verify ownership
    const supabase = createSupabaseAdmin();
    const { data: business, error } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (error || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // State encodes businessId for the callback
    const state = Buffer.from(JSON.stringify({ businessId, userId: user.id })).toString("base64");
    const authUrl = getGoogleAuthUrl(state);

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Google connect error:", error);
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 });
  }
}
