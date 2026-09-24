"use server";

import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/schema";

const emailSchema = z.string().trim().toLowerCase().email();
const sourceSchema = z.string().trim().max(50).default("landing");

export type JoinWaitlistResult = { ok: true } | { ok: false; reason: string };

export async function joinWaitlist(input: { email: string; source?: string }): Promise<JoinWaitlistResult> {
  const email = emailSchema.safeParse(input.email);
  if (!email.success) return { ok: false, reason: "That doesn't look like a valid email address." };

  const source = sourceSchema.safeParse(input.source ?? "landing");
  if (!source.success) return { ok: false, reason: "Invalid source." };

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL UNIQUE,
        source varchar(50) NOT NULL DEFAULT 'landing',
        created_at timestamp NOT NULL DEFAULT now()
      )
    `);
    await db.insert(waitlist).values({ email: email.data, source: source.data }).onConflictDoNothing();
    return { ok: true };
  } catch (error) {
    console.error("Error saving waitlist entry:", error);
    return { ok: false, reason: "Something went wrong on our end — please try again in a moment." };
  }
}