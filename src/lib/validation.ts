import { z } from "zod";
import { ValidationError } from "@/lib/errors";

// Runtime validation for server-action inputs. TypeScript only enforces the
// client→server contract at compile time; these schemas make the boundary
// actually enforce it at runtime, rejecting malformed or oversized payloads
// before they reach the database.

export const uuidSchema = z.string().uuid("Must be a valid id");

export const text = (max: number) => z.string().trim().min(1).max(max);

export const optionalText = (max: number) =>
  z.string().trim().max(max).nullish();

export const urlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, "Must be a valid http(s) URL");

export const videoDurationSchema = z
  .string()
  .trim()
  .regex(/^\d{1,2}:\d{2}(:\d{2})?$/, "Use MM:SS or HH:MM:SS");

export const stripeSessionIdSchema = z
  .string()
  .trim()
  .max(200)
  .regex(/^cs_(test|live)_[A-Za-z0-9]+$/, "Invalid checkout session id");

export const nonNegativeInt = z.number().int().nonnegative();

export interface ValidationIssue {
  path: string;
  message: string;
}

export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const issues: ValidationIssue[] = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    throw new ValidationError("Invalid input", issues);
  }
  return result.data;
}

export function parseUuid(input: unknown, field = "id"): string {
  return parse(z.string().uuid(`${field} must be a valid id`), input);
}

export function parseText(input: unknown, max: number, field = "value"): string {
  return parse(text(max), input);
}
