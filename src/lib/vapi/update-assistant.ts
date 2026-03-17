import { Business, KnowledgeBaseEntry } from "@/types";
import { vapiRequest } from "./client";
import { generateAssistantPrompt, generateFirstMessage } from "./generate-prompt";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function updateVapiAssistant(business: Business): Promise<void> {
  if (!business.vapi_assistant_id) {
    throw new Error("Business does not have a Vapi assistant ID");
  }

  // Fetch knowledge base entries for this business
  const supabase = createSupabaseAdmin();
  const { data: kbEntries } = await supabase
    .from("knowledge_base_entries")
    .select("*")
    .eq("business_id", business.id)
    .eq("is_active", true);

  const systemPrompt = generateAssistantPrompt(business, (kbEntries as KnowledgeBaseEntry[]) || []);
  const firstMessage = generateFirstMessage(business);

  await vapiRequest(`/assistant/${business.vapi_assistant_id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: `${business.business_name} Receptionist`,
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
      },
      firstMessage,
    }),
  });
}
