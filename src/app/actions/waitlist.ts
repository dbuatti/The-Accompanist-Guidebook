"use server";
import { logger } from "@/lib/logger";

import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/schema";
import { subscribeToKit } from "@/lib/kit";
import { checkRateLimit } from "@/lib/rate-limit";

const emailSchema = z.string().trim().toLowerCase().email();
const sourceSchema = z.string().trim().max(50).default("landing");

function clientRateLimitKey(): string {
  const h = headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return `waitlist:${ip}`;
}

export type JoinWaitlistResult = { ok: true } | { ok: false; reason: string };

export async function joinWaitlist(input: { email: string; source?: string }): Promise<JoinWaitlistResult> {
  // Public, unauthenticated endpoint — throttle by IP before touching the DB.
  const rate = checkRateLimit(clientRateLimitKey(), 5, 10 * 60_000);
  if (!rate.allowed) {
    return { ok: false, reason: "Too many sign-ups from this connection — please try again shortly." };
  }

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
  } catch (error) {
    logger.error("Error saving waitlist entry:", error);
    return { ok: false, reason: "Something went wrong on our end — please try again in a moment." };
  }

  // Keep Kit in sync so automations can run. Never blocks the signup itself.
  await subscribeToKit({ email: email.data, source: source.data });

  return { ok: true };
}