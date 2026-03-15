export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * This webhook is called by Supabase Auth when certain events happen.
 * Configure it in Supabase Dashboard > Auth > Hooks, or use a database
 * trigger instead (see migration below).
 *
 * For now, user creation in the `users` table is handled by a Postgres
 * trigger on auth.users (see migration.sql update).
 *
 * This route is kept as a fallback / manual sync endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("x-webhook-secret");
    if (token !== process.env.CRON_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type, record } = body;

    if (type === "INSERT" && record) {
      const supabase = createSupabaseAdmin();

      // Check if user already exists
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", record.id)
        .single();

      if (!existing) {
        const { error } = await supabase.from("users").insert({
          auth_id: record.id,
          email: record.email,
          full_name: record.raw_user_meta_data?.full_name || null,
        });

        if (error) {
          console.error("Failed to create user:", error);
          return new NextResponse("Database Error", { status: 500 });
        }

        console.log(`User created: ${record.email}`);
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Auth webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
