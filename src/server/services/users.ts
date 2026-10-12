import { db } from "@/lib/db";
import { users, progress } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getErrorMessage, serializeError } from "@/lib/errors";
import { requireUser, requireAdmin } from "@/lib/auth";
import { ADMIN_EMAILS } from "@/lib/admin";
import { parseUuid, parse, optionalText } from "@/lib/validation";

export async function ensureUserExists() {
  try {
    const user = await requireUser();
    const existing = await db.select().from(users).where(eq(users.id, user.id));
    if (existing.length === 0) {
      const role = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase()) ? "admin" : "user";
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        name: user.name || null,
        role,
      });
    }
  } catch (error) {
    console.error("Error ensuring user exists (FULL ERROR):", serializeError(error));
  }
}

export async function getAllUsers() {
  await requireAdmin();
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Error fetching users (FULL ERROR):", getErrorMessage(error));
    return [];
  }
}

export async function getPaidStatus() {
  try {
    const user = await requireUser();
    const existing = await db.select().from(users).where(eq(users.id, user.id));
    return { isPaid: existing.length > 0 && existing[0].isPaid === true };
  } catch (error) {
    console.error("Error fetching paid status (FULL ERROR):", getErrorMessage(error));
    return { isPaid: false };
  }
}

export async function updateUser(userId: string, data: { name?: string; role?: string }) {
  await requireAdmin();
  userId = parseUuid(userId, "userId");
  if (data.name !== undefined) data.name = parse(optionalText(255), data.name) ?? undefined;
  if (data.role !== undefined) data.role = parse(z.enum(["user", "admin"]), data.role);
  try {
    await db.update(users).set(data).where(eq(users.id, userId));
    revalidatePath("/admin/users");
  } catch (error) {
    console.error("Error updating user (FULL ERROR):", getErrorMessage(error));
    throw new Error("Failed to update user: " + getErrorMessage(error));
  }
}

// Grant or remove course access by hand — for comps (teachers, reviewers,
// testimonial givers) and for sorting out a purchase that didn't unlock.
export async function setUserAccess(userId: string, isPaid: boolean) {
  await requireAdmin();
  userId = parseUuid(userId, "userId");
  isPaid = parse(z.boolean(), isPaid);
  await db.update(users).set({ isPaid }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
  return { isPaid };
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  userId = parseUuid(userId, "userId");
  try {
    // progress.user_id has no ON DELETE CASCADE, so remove the learner's
    // progress first or the delete fails for anyone who has started lessons.
    await db.delete(progress).where(eq(progress.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin/users");
  } catch (error) {
    console.error("Error deleting user (FULL ERROR):", getErrorMessage(error));
    throw new Error("Failed to delete user: " + getErrorMessage(error));
  }
}
