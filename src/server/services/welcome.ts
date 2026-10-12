import { db } from "@/lib/db";
import { welcomeContent } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/errors";
import { requireUser, requireAdmin } from "@/lib/auth";
import { parseText } from "@/lib/validation";

export async function getWelcomeContent() {
  try {
    await requireUser();
    const rows = await db.select().from(welcomeContent).where(eq(welcomeContent.id, "welcome"));
    return rows.length > 0 ? { title: rows[0].title, content: rows[0].content } : null;
  } catch (error) {
    console.error("Error fetching welcome content (FULL ERROR):", getErrorMessage(error));
    return null;
  }
}

export async function updateWelcomeContent(title: string, content: string) {
  await requireAdmin();
  title = parseText(title, 200, "title");
  content = parseText(content, 100000, "content");
  try {
    await db.insert(welcomeContent)
      .values({ id: "welcome", title, content })
      .onConflictDoUpdate({
        target: welcomeContent.id,
        set: { title, content, updatedAt: new Date() },
      });
    revalidatePath("/welcome");
    revalidatePath("/admin/welcome");
    return { success: true };
  } catch (error) {
    console.error("Error updating welcome content (FULL ERROR):", getErrorMessage(error));
    throw new Error("Failed to update welcome content: " + getErrorMessage(error));
  }
}
