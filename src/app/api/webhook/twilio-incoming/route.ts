export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const twilio = (await import("twilio")).default;
    const VoiceResponse = twilio.twiml.VoiceResponse;

    // Parse form data from Twilio
    const formData = await req.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    // Validate Twilio signature for security
    const signature = req.headers.get("x-twilio-signature") || "";
    const url = req.url;

    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const isValid = twilio.validateRequest(authToken, signature, url, body);

    if (!isValid) {
      console.error("Invalid Twilio signature");
      return new NextResponse("Forbidden", { status: 403 });
    }

    const toPhoneNumber = body.To;

    if (!toPhoneNumber) {
      console.error("No 'To' phone number in request");
      return new NextResponse("Bad Request", { status: 400 });
    }

    // Look up business by phone number
    const supabase = createSupabaseAdmin();
    const { data: business, error } = await supabase
      .from("businesses")
      .select("id, business_name, calls_used_this_month, calls_limit, vapi_assistant_id")
      .eq("twilio_phone_number", toPhoneNumber)
      .eq("is_active", true)
      .single();

    if (error || !business) {
      console.error("Business not found for phone number:", toPhoneNumber, error);
      const twiml = new VoiceResponse();
      twiml.say("We're sorry, this service is temporarily unavailable.");
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Check if business has calls remaining
    if (business.calls_used_this_month >= business.calls_limit) {
      console.warn(
        `Business ${business.business_name} has exceeded call limit (${business.calls_used_this_month}/${business.calls_limit})`
      );
      const twiml = new VoiceResponse();
      twiml.say("We're sorry, this service is temporarily unavailable.");
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Connect to Vapi inbound phone number
    const vapiPhoneNumber = process.env.VAPI_INBOUND_PHONE_NUMBER;

    if (!vapiPhoneNumber) {
      console.error("VAPI_INBOUND_PHONE_NUMBER not configured");
      const twiml = new VoiceResponse();
      twiml.say("We're sorry, this service is temporarily unavailable.");
      return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Build TwiML to dial Vapi
    const twiml = new VoiceResponse();
    twiml.dial({
      callerId: toPhoneNumber,
    }, vapiPhoneNumber);

    console.log(`Forwarding call for ${business.business_name} to Vapi`);

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Error in twilio-incoming webhook:", error);
    const twiml = new VoiceResponse();
    twiml.say("We're sorry, an error occurred. Please try again later.");
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
