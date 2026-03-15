import { getTwilioClient } from "./client";

export async function buyPhoneNumber(areaCode?: string): Promise<{
  phoneNumber: string;
  sid: string;
}> {
  const client = getTwilioClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const searchParams: Record<string, unknown> = {
    voiceEnabled: true,
    smsEnabled: true,
    limit: 1,
  };
  if (areaCode) {
    searchParams.areaCode = areaCode;
  }

  const available = await client
    .availablePhoneNumbers("US")
    .local.list(searchParams);

  if (available.length === 0) {
    // Try without area code constraint
    const fallback = await client
      .availablePhoneNumbers("US")
      .local.list({ voiceEnabled: true, smsEnabled: true, limit: 1 });
    if (fallback.length === 0) {
      throw new Error("No phone numbers available");
    }
    available.push(fallback[0]);
  }

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: available[0].phoneNumber,
    voiceUrl: `${appUrl}/api/webhook/twilio-incoming`,
    voiceMethod: "POST",
    statusCallback: `${appUrl}/api/webhook/twilio-status`,
    statusCallbackMethod: "POST",
  });

  return {
    phoneNumber: purchased.phoneNumber,
    sid: purchased.sid,
  };
}
