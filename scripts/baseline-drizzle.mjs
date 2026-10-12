// Mark the first Drizzle migration as already applied so `pnpm db:migrate`
// starts clean against a database that was previously provisioned by hand
// (the `scripts/*.sql` era). It mirrors exactly what the neon-http migrator
// records (see node_modules/drizzle-orm/neon-http/migrator.cjs):
//
//   CREATE SCHEMA drizzle;
//   CREATE TABLE drizzle.__drizzle_migrations (
//     id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint
//   );
//   INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (...);
//
// Run it ONCE, before the first future `pnpm db:generate` + `db:migrate` cycle:
//   pnpm db:baseline
//
// From then on, schema changes go through the normal flow:
//   pnpm db:generate    # diff schema.ts -> new .sql migration
//   pnpm db:migrate     # apply pending migrations

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const journal = JSON.parse(readFileSync(path.join(root, "drizzle", "meta", "_journal.json"), "utf8"));
const migrationFile = journal.entries?.[0];

if (!migrationFile) {
  console.error("No Drizzle migrations found — run `pnpm db:generate` first.");
  process.exit(1);
}

const migrationSqlPath = path.join(root, "drizzle", `${migrationFile.tag}.sql`);
const sql = readFileSync(migrationSqlPath, "utf8");
const hash = createHash("sha256").update(sql).digest("hex");
const createdAt = migrationFile.when;

// The migrator keys off DATABASE_URL via the neon driver. Read it from
// .env.local first (Next's own env loading doesn't run here), then .env.
function loadDotenv(file) {
  const full = path.join(root, file);
  if (!existsSync(full)) return {};
  const out = {};
  for (const rawLine of readFileSync(full, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in out)) out[key] = value;
  }
  return out;
}

const databaseUrl =
  process.env.DATABASE_URL ||
  loadDotenv(".env.local").DATABASE_URL ||
  loadDotenv(".env").DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL not found in .env.local or environment.");
  process.exit(1);
}

async function main() {
  const sqlExec = neon(databaseUrl);

  await sqlExec("CREATE SCHEMA IF NOT EXISTS drizzle");
  await sqlExec(`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash text NOT NULL,
    created_at bigint
  )`);

  const already = await sqlExec(
    `SELECT id, hash FROM drizzle.__drizzle_migrations WHERE hash = $1`,
    [hash],
  );

  if (already.length > 0) {
    console.log(`Baseline already recorded (${migrationFile.tag}). Nothing to do.`);
    return;
  }

  await sqlExec(
    `INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)`,
    [hash, createdAt],
  );
  console.log(`Marked ${migrationFile.tag} as applied (hash ${hash.slice(0, 12)}…).`);
}

main().catch((error) => {
  console.error("Baseline failed:", error);
  process.exit(1);
});