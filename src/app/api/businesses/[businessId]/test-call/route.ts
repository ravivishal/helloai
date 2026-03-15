export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { vapiRequest } from "@/lib/vapi/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    // Get business and verify ownership
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", params.businessId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (!business.vapi_assistant_id) {
      return NextResponse.json(
        { error: "Assistant not configured" },
        { status: 400 }
      );
    }

    if (!business.owner_phone) {
      return NextResponse.json(
        { error: "Owner phone number not set" },
        { status: 400 }
      );
    }

    // Trigger test call via Vapi
    const call = await vapiRequest("/call/phone", {
      method: "POST",
      body: JSON.stringify({
        assistantId: business.vapi_assistant_id,
        customer: {
          number: business.owner_phone,
        },
      }),
    });

    return NextResponse.json({
      success: true,
      call,
    });
  } catch (error) {
    console.error("POST /api/businesses/[businessId]/test-call error:", error);
    return NextResponse.json(
      { error: "Failed to initiate test call" },
      { status: 500 }
    );
  }
}
