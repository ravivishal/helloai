let twilioClient: any = null;

export async function getTwilioClient() {
  if (!twilioClient) {
    const twilio = (await import("twilio")).default;
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }
  return twilioClient;
}
