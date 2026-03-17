export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { updateVapiAssistant } from "@/lib/vapi/update-assistant";
import { Business } from "@/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { businessId: string; entryId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createSupabaseAdmin();

    // Verify ownership
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", params.businessId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { data: entry, error } = await supabase
      .from("knowledge_base_entries")
      .update({
        question: body.question,
        answer: body.answer,
        category: body.category,
      })
      .eq("id", params.entryId)
      .eq("business_id", params.businessId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(entry);
  } catch (error) {
    console.error("PATCH knowledge-base entry error:", error);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { businessId: string; entryId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    // Verify ownership
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", params.businessId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Soft delete
    const { error } = await supabase
      .from("knowledge_base_entries")
      .update({ is_active: false })
      .eq("id", params.entryId)
      .eq("business_id", params.businessId);

    if (error) throw error;

    // Sync Vapi assistant with updated knowledge base
    const { data: fullBusiness } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", params.businessId)
      .single();

    if (fullBusiness?.vapi_assistant_id) {
      try {
        await updateVapiAssistant(fullBusiness as Business);
      } catch (vapiError) {
        console.error("Failed to sync Vapi after KB delete:", vapiError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE knowledge-base entry error:", error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
