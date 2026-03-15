import { Business } from "@/types";
import { vapiRequest } from "./client";
import { generateAssistantPrompt, generateFirstMessage } from "./generate-prompt";

interface VapiAssistant {
  id: string;
  name: string;
}

export async function createVapiAssistant(
  business: Business
): Promise<VapiAssistant> {
  const systemPrompt = generateAssistantPrompt(business);
  const firstMessage = generateFirstMessage(business);

  const assistant = await vapiRequest<VapiAssistant>("/assistant", {
    method: "POST",
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
      voice: {
        provider: "11labs",
        voiceId: "paula",
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      firstMessage,
      endCallMessage:
        "Thank you so much for calling. We'll be in touch with you shortly. Have a great day!",
      maxDurationSeconds: 300,
      silenceTimeoutSeconds: 30,
      serverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/vapi-call-ended?token=${process.env.VAPI_API_KEY}`,
    }),
  });

  return assistant;
}
