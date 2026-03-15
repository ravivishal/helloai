export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    // Get call with full transcript
    const { data: call, error: callError } = await supabase
      .from("calls")
      .select("*, businesses!inner(user_id)")
      .eq("id", params.callId)
      .single();

    if (callError || !call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Verify the call belongs to user's business
    if (call.businesses.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Remove the businesses join data before returning
    const { businesses, ...callData } = call;

    return NextResponse.json(callData);
  } catch (error) {
    console.error("GET /api/calls/[callId] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch call" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createSupabaseAdmin();

    // Verify ownership through business
    const { data: call, error: verifyError } = await supabase
      .from("calls")
      .select("*, businesses!inner(user_id)")
      .eq("id", params.callId)
      .single();

    if (verifyError || !call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    if (call.businesses.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update call
    const { data: updatedCall, error: updateError } = await supabase
      .from("calls")
      .update(body)
      .eq("id", params.callId)
      .select()
      .single();

    if (updateError || !updatedCall) {
      throw updateError || new Error("Failed to update call");
    }

    return NextResponse.json(updatedCall);
  } catch (error) {
    console.error("PATCH /api/calls/[callId] error:", error);
    return NextResponse.json(
      { error: "Failed to update call" },
      { status: 500 }
    );
  }
}
