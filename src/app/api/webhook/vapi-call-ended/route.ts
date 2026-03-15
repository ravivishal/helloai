import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { extractCallData } from "@/lib/openai/extract-call-data";
import { sendSMS } from "@/lib/twilio/send-sms";
import { sendCallSummaryEmail } from "@/lib/resend/client";
import { VapiWebhookPayload } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Verify secret token from query param
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (token !== process.env.VAPI_API_KEY) {
      console.error("Invalid Vapi webhook token");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse webhook payload
    const payload: VapiWebhookPayload = await req.json();

    if (payload.message.type !== "end-of-call-report") {
      console.log(`Ignoring Vapi webhook type: ${payload.message.type}`);
      return new NextResponse("OK", { status: 200 });
    }

    const call = payload.message.call;
    const artifact = payload.message.artifact;

    if (!call || !call.id) {
      console.error("Invalid Vapi webhook payload - missing call data");
      return new NextResponse("Bad Request", { status: 400 });
    }

    console.log(`Processing end-of-call report for Vapi call ${call.id}`);

    // Find business by vapi_assistant_id
    const supabase = createSupabaseAdmin();
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("*")
      .eq("vapi_assistant_id", call.assistantId)
      .single();

    if (businessError || !business) {
      console.error("Business not found for assistant ID:", call.assistantId, businessError);
      return new NextResponse("Business Not Found", { status: 404 });
    }

    // Extract transcript messages
    const transcript = artifact?.messages || call.messages || [];

    if (transcript.length === 0) {
      console.warn("No transcript available for call", call.id);
    }

    // Extract structured data using OpenAI
    console.log(`Extracting call data for ${business.business_name}...`);
    const extractedData = await extractCallData(transcript, business.business_name);

    // Calculate call duration
    let callDurationSeconds: number | null = null;
    if (call.startedAt && call.endedAt) {
      const startTime = new Date(call.startedAt).getTime();
      const endTime = new Date(call.endedAt).getTime();
      callDurationSeconds = Math.floor((endTime - startTime) / 1000);
    }

    // Parse appointment datetime if provided
    let appointmentDatetime: string | null = null;
    if (extractedData.appointmentPreference) {
      // For now, store as null - would need more sophisticated date parsing
      // Could use a library like chrono-node or send to GPT for parsing
      appointmentDatetime = null;
    }

    // Store call in database
    const { data: callRecord, error: callError } = await supabase
      .from("calls")
      .insert({
        business_id: business.id,
        caller_phone: call.customer?.number || null,
        caller_name: extractedData.callerName,
        call_duration_seconds: callDurationSeconds,
        twilio_call_sid: call.phoneCallProviderId || null,
        vapi_call_id: call.id,
        call_summary: extractedData.summary,
        caller_need: extractedData.callerNeed,
        urgency: extractedData.urgency,
        caller_address: extractedData.callerAddress,
        caller_email: extractedData.callerEmail,
        appointment_requested: extractedData.appointmentRequested,
        appointment_datetime: appointmentDatetime,
        transcript: transcript as any,
        recording_url: artifact?.recordingUrl || call.recordingUrl || null,
        sentiment: extractedData.sentiment,
        call_outcome: extractedData.callOutcome,
        ai_confidence_score: extractedData.confidenceScore,
        sms_sent: false,
        email_sent: false,
        owner_reviewed: false,
        status: "completed",
      })
      .select()
      .single();

    if (callError) {
      console.error("Failed to insert call record:", callError);
      return new NextResponse("Database Error", { status: 500 });
    }

    console.log(`Call record created: ${callRecord.id}`);

    // Build dashboard URL
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calls/${callRecord.id}`;

    // Get urgency emoji for notifications
    const urgencyEmoji =
      extractedData.urgency === "emergency"
        ? "🚨"
        : extractedData.urgency === "high"
          ? "🔴"
          : extractedData.urgency === "medium"
            ? "🟡"
            : "🟢";

    // Send SMS to business owner
    const smsBody = `${urgencyEmoji} New Call for ${business.business_name}
From: ${extractedData.callerName || "Unknown"}
Need: ${extractedData.callerNeed || "Not specified"}
${extractedData.summary}
View: ${dashboardUrl}`;

    const smsSent = await sendSMS(business.owner_phone, smsBody, business.twilio_phone_number || undefined);

    if (smsSent) {
      console.log(`SMS sent to ${business.owner_phone}`);
      await supabase
        .from("calls")
        .update({ sms_sent: true })
        .eq("id", callRecord.id);
    }

    // Send email if owner email is available
    if (business.owner_email) {
      const emailSent = await sendCallSummaryEmail(
        business.owner_email,
        business.business_name,
        extractedData.callerName,
        extractedData.callerNeed,
        extractedData.summary,
        extractedData.urgency,
        dashboardUrl
      );

      if (emailSent) {
        console.log(`Email sent to ${business.owner_email}`);
        await supabase
          .from("calls")
          .update({ email_sent: true })
          .eq("id", callRecord.id);
      }
    }

    // Increment calls_used_this_month
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        calls_used_this_month: business.calls_used_this_month + 1,
      })
      .eq("id", business.id);

    if (updateError) {
      console.error("Failed to increment calls_used_this_month:", updateError);
    } else {
      console.log(`Incremented call count for ${business.business_name} to ${business.calls_used_this_month + 1}`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error in vapi-call-ended webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
