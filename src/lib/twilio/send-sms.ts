import { getTwilioClient } from "./client";

export async function sendSMS(to: string, body: string): Promise<boolean> {
  try {
    const client = getTwilioClient();
    await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body,
    });
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}
