import { z } from "zod";

// Single source of truth for runtime configuration. Validates everything the
// app reads from process.env and fails fast in production so a missing secret
// surfaces at deploy time instead of as a silent dummy fallback (which for a
// cookie-signing secret would be a session-forgery hole).
//
// During the build phase (NEXT_PHASE === "phase-production-build") we tolerate
// missing values so static generation can proceed in CI without real secrets;
// the real gate is the production *server* runtime.

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PHASE: z.string().optional(),

  // Required server secrets.
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEON_AUTH_BASE_URL: z.string().min(1, "NEON_AUTH_BASE_URL is required"),
  NEON_AUTH_COOKIE_SECRET: z
    .string()
    .min(32, "NEON_AUTH_COOKIE_SECRET must be at least 32 characters"),

  // Public.
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_PAYMENT_LINK: z.string().url().optional(),

  // Optional integrations (feature-gated by presence).
  GEMINI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  KIT_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

const BUILD_PLACEHOLDERS: Record<string, string> = {
  DATABASE_URL: "postgres://build:build@localhost:5432/build",
  NEON_AUTH_BASE_URL: "https://build.neonauth.example.com",
  NEON_AUTH_COOKIE_SECRET: "build-phase-placeholder-secret-32-chars-min",
};

function isProductionServer(): boolean {
  return process.env.NEXT_PHASE === "phase-production-server";
}

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (parsed.success) return parsed.data;

  const problems = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  if (isProductionServer()) {
    throw new Error(`Invalid environment configuration: ${problems}`);
  }

  // Build/dev/test: fill placeholders and keep going, but always surface it.
  console.warn(`[env] Incomplete configuration (non-production): ${problems}`);
  return envSchema.parse({ ...process.env, ...BUILD_PLACEHOLDERS });
}

export const env = loadEnv();
