import { Business } from "@/types";
import { vapiRequest } from "./client";
import { generateAssistantPrompt, generateFirstMessage } from "./generate-prompt";

export async function updateVapiAssistant(business: Business): Promise<void> {
  if (!business.vapi_assistant_id) {
    throw new Error("Business does not have a Vapi assistant ID");
  }

  const systemPrompt = generateAssistantPrompt(business);
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
