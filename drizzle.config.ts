import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load local env so generate/migrate/push/studio can find DATABASE_URL outside
// Next's own env loading (`.env.local` wins, falls back to `.env`).
dotenv.config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});