-- ============================================================
-- Add: is_paid column to users (course gating — Level 1 free,
-- Levels 2-3 behind a one-time purchase)
-- The Accompanist Guidebook
-- ============================================================
-- Safe:     Idempotent (IF NOT EXISTS) — safe to re-run.
-- Non-destructive: purely additive; no backup required.
-- Run in:   Neon SQL Editor (project: neondb, branch: production)
-- ============================================================

-- 1) ADD THE COLUMN. Default false = everyone is unpaid until marked.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false;

-- 2) VERIFY — should list is_paid with the other user columns.
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'is_paid';

-- 3) SANITY — count of users that would be considered paid.
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS paid_users FROM users WHERE is_paid = true;

-- ============================================================
-- ROLLBACK (only if something went wrong):
-- ALTER TABLE users DROP COLUMN is_paid;
-- ============================================================
