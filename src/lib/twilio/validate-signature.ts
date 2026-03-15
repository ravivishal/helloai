export async function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): Promise<boolean> {
  const twilio = (await import("twilio")).default;
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  );
}
