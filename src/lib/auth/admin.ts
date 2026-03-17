import { getApiUser } from "./api";

/**
 * Get the authenticated user and verify they have admin or superadmin role.
 * Returns the user if they are an admin, null otherwise.
 */
export async function getAdminUser() {
  const user = await getApiUser();
  if (!user) return null;
  if (user.role !== "admin" && user.role !== "superadmin") return null;
  return user;
}
