export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { buyPhoneNumber } from "@/lib/twilio/buy-number";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { area_code } = body;

    const { phoneNumber, sid } = await buyPhoneNumber(area_code);

    return NextResponse.json({ phoneNumber, sid }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/twilio/buy error:", error);
    return NextResponse.json({ error: "Failed to buy phone number" }, { status: 500 });
  }
}
