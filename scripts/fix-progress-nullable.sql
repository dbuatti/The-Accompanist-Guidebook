-- Lesson progress: allow "watched but not finished".
-- Symptom: un-ticking "Completed" on a lesson returned a server error, and
-- resume-where-you-left-off couldn't save for lessons not yet completed.
-- Likely cause: progress.completed_at was created NOT NULL in production,
-- while the app (src/lib/schema.ts) expects it to be nullable.
-- Run in the Neon SQL editor (project → SQL Editor → neondb).

-- 1. Check (is_nullable should say YES):
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'progress' AND column_name = 'completed_at';

-- 2. If it says NO, fix it:
ALTER TABLE progress ALTER COLUMN completed_at DROP NOT NULL;
