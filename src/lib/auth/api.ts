import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Get the authenticated user from Supabase Auth in API routes.
 * Returns the internal user record (from `users` table) or null.
 */
export async function getApiUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can't set cookies in certain contexts
          }
        },
      },
    }
  );

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // Look up internal user by auth_id (Supabase auth UUID)
  const admin = createSupabaseAdmin();
  const { data: user, error } = await admin
    .from("users")
    .select("*")
    .eq("auth_id", authUser.id)
    .single();

  if (error || !user) return null;

  return user;
}
