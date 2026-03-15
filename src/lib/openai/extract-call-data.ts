import OpenAI from "openai";
import { ExtractedCallData, TranscriptMessage } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function extractCallData(
  transcript: TranscriptMessage[],
  businessName: string
): Promise<ExtractedCallData> {
  const transcriptText = transcript
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are analyzing a phone call transcript for ${businessName}. Extract structured information from the conversation and return it as JSON.

Return a JSON object with these exact fields:
- "callerName": string or null — the caller's name if mentioned
- "callerNeed": string or null — brief description of what the caller needs (e.g., "Leaking kitchen faucet", "Teeth cleaning appointment")
- "urgency": one of "low", "medium", "high", "emergency"
  Urgency guide:
  - "low": general inquiry, scheduling for future, no time pressure
  - "medium": needs service soon but not an emergency (e.g., "sometime this week")
  - "high": needs service today or very soon, significant inconvenience
  - "emergency": flooding, gas leak, severe pain, electrical fire, safety hazard
- "callerAddress": string or null — any address or location mentioned
- "callerEmail": string or null — email if provided
- "appointmentRequested": boolean — whether they asked about scheduling
- "appointmentPreference": string or null — preferred time/date if mentioned
- "summary": string — 2-3 sentence summary of the call
- "sentiment": one of "positive", "neutral", "negative" — caller's overall tone
- "callOutcome": one of "appointment_booked", "message_taken", "info_provided", "caller_hung_up", "transferred"
- "confidenceScore": number between 0 and 1 — how confident you are in the extraction`,
        },
        {
          role: "user",
          content: `Here is the call transcript:\n\n${transcriptText}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    const parsed = JSON.parse(content) as ExtractedCallData;
    return {
      callerName: parsed.callerName || null,
      callerNeed: parsed.callerNeed || null,
      urgency: parsed.urgency || "low",
      callerAddress: parsed.callerAddress || null,
      callerEmail: parsed.callerEmail || null,
      appointmentRequested: parsed.appointmentRequested || false,
      appointmentPreference: parsed.appointmentPreference || null,
      summary: parsed.summary || "Call transcript processed.",
      sentiment: parsed.sentiment || "neutral",
      callOutcome: parsed.callOutcome || "message_taken",
      confidenceScore: parsed.confidenceScore || 0.5,
    };
  } catch (error) {
    console.error("Failed to extract call data:", error);
    return {
      callerName: null,
      callerNeed: null,
      urgency: "low",
      callerAddress: null,
      callerEmail: null,
      appointmentRequested: false,
      appointmentPreference: null,
      summary: "Call received — transcript could not be fully analyzed.",
      sentiment: "neutral",
      callOutcome: "message_taken",
      confidenceScore: 0.0,
    };
  }
}
