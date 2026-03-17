export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth/api";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { deleteCalendarEvent } from "@/lib/google/calendar";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createSupabaseAdmin();

    // Verify ownership via business
    const { data: appointment, error: apptError } = await supabase
      .from("appointments")
      .select("*, businesses!inner(user_id)")
      .eq("id", params.appointmentId)
      .single();

    if (apptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if ((appointment as any).businesses.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("appointments")
      .update(body)
      .eq("id", params.appointmentId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/appointments/[appointmentId] error:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const user = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();

    // Get appointment with business info
    const { data: appointment, error: apptError } = await supabase
      .from("appointments")
      .select("*, businesses!inner(user_id, google_refresh_token, google_calendar_id)")
      .eq("id", params.appointmentId)
      .single();

    if (apptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if ((appointment as any).businesses.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete Google Calendar event if synced
    const biz = (appointment as any).businesses;
    if (appointment.google_event_id && biz.google_refresh_token) {
      try {
        await deleteCalendarEvent(
          biz.google_refresh_token,
          biz.google_calendar_id || "primary",
          appointment.google_event_id
        );
      } catch (calError) {
        console.error("Failed to delete Google Calendar event:", calError);
      }
    }

    // Cancel the appointment (soft delete)
    const { error: deleteError } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", params.appointmentId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/appointments/[appointmentId] error:", error);
    return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 });
  }
}
