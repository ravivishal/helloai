import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Get the authenticated user's ID from Supabase Auth on the server side.
 * Returns the user's auth UUID or null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
