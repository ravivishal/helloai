export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const twilio = (await import("twilio")).default;

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

    const callSid = body.CallSid;
    const callStatus = body.CallStatus;
    const callDuration = body.CallDuration;

    if (!callSid) {
      console.error("No CallSid in status callback");
      return new NextResponse("Bad Request", { status: 400 });
    }

    console.log(`Twilio status callback: ${callSid} - ${callStatus}`, {
      duration: callDuration,
    });

    // If call is completed and we have duration, update the call record
    if (callStatus === "completed" && callDuration) {
      const supabase = createSupabaseAdmin();

      const { error } = await supabase
        .from("calls")
        .update({
          call_duration_seconds: parseInt(callDuration, 10),
          status: "completed",
        })
        .eq("twilio_call_sid", callSid);

      if (error) {
        console.error("Failed to update call duration:", error);
      } else {
        console.log(`Updated call duration for ${callSid}: ${callDuration}s`);
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error in twilio-status webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
