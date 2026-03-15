let resendClient: any = null;

export async function getResend() {
  if (!resendClient) {
    const { Resend } = await import("resend");
    resendClient = new Resend(process.env.RESEND_API_KEY!);
  }
  return resendClient;
}

export async function sendCallSummaryEmail(
  to: string,
  businessName: string,
  callerName: string | null,
  callerNeed: string | null,
  summary: string,
  urgency: string,
  callDetailUrl: string
): Promise<boolean> {
  try {
    const resend = await getResend();
    const urgencyEmoji =
      urgency === "emergency"
        ? "🚨"
        : urgency === "high"
          ? "🔴"
          : urgency === "medium"
            ? "🟡"
            : "🟢";

    await resend.emails.send({
      from: `MissedCall.ai <notifications@missedcall.ai>`,
      to,
      subject: `${urgencyEmoji} New call for ${businessName}${callerName ? ` from ${callerName}` : ""}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563EB; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">📞 New Call Summary</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">${businessName}</p>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Urgency</p>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">${urgencyEmoji} ${urgency.charAt(0).toUpperCase() + urgency.slice(1)}</p>
            </div>
            ${callerName ? `<div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;"><p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Caller</p><p style="margin: 0; font-size: 16px;">${callerName}</p></div>` : ""}
            ${callerNeed ? `<div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;"><p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">What They Need</p><p style="margin: 0; font-size: 16px;">${callerNeed}</p></div>` : ""}
            <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Summary</p>
              <p style="margin: 0; font-size: 16px; line-height: 1.5;">${summary}</p>
            </div>
            <a href="${callDetailUrl}" style="display: block; background: #2563EB; color: white; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Full Call Details</a>
          </div>
          <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
            Powered by MissedCall.ai
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
