import { auth } from "@/lib/auth/server";
import { isAdmin } from "@/lib/admin";

export async function getCurrentUser() {
  const { data: session } = await auth.getSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user.email)) throw new Error("Forbidden");
  return user;
}
