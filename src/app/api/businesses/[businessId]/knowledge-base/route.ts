export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { updateVapiAssistant } from "@/lib/vapi/update-assistant";
import { Business } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
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

    const { data: entries, error } = await supabase
      .from("knowledge_base_entries")
      .select("*")
      .eq("business_id", params.businessId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(entries || []);
  } catch (error) {
    console.error("GET /api/businesses/[businessId]/knowledge-base error:", error);
    return NextResponse.json({ error: "Failed to fetch knowledge base" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { question, answer, category } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
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

    const { data: entry, error } = await supabase
      .from("knowledge_base_entries")
      .insert({
        business_id: params.businessId,
        question,
        answer,
        category: category || "general",
      })
      .select()
      .single();

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
        console.error("Failed to sync Vapi after KB update:", vapiError);
      }
    }

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/businesses/[businessId]/knowledge-base error:", error);
    return NextResponse.json({ error: "Failed to create knowledge base entry" }, { status: 500 });
  }
}
