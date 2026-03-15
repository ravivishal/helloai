import { getTwilioClient } from "./client";

export async function sendSMS(to: string, body: string, from?: string): Promise<boolean> {
  try {
    const client = await getTwilioClient();
    await client.messages.create({
      to,
      from: from || process.env.TWILIO_PHONE_NUMBER!,
      body,
    });
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}
