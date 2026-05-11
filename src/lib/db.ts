import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL is not defined. Database features will not work.");
}

const sql = neon(databaseUrl || "");
export const db = drizzle(sql);