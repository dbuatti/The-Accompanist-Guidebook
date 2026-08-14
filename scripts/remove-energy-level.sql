-- ============================================================
-- Remove: energy_level column (admin-only ADHD authoring tag,
-- never shown to students — removed as part of the admin IA
-- overhaul, 14 Aug 2026)
-- The Accompanist Guidebook
-- ============================================================
-- Backup:   A snapshot table is created before the DROP.
-- Safe:     Backup step is idempotent (IF NOT EXISTS).
-- Run in:   Neon SQL Editor (project: neondb, branch: production)
-- ============================================================

-- 1) BACKUP — cheap snapshot of the column before dropping it.
--    Safe to re-run (IF NOT EXISTS). Drop it once you've confirmed.
CREATE TABLE IF NOT EXISTS lessons_energy_level_backup_20260814 AS
SELECT id, title, energy_level, created_at
FROM lessons;

-- 2) THE DROP.
ALTER TABLE lessons DROP COLUMN IF EXISTS energy_level;

-- 3) VERIFY — should error ("column energy_level does not exist")
--    if you try to select it; this should return the current row count.
SELECT COUNT(*) AS total_lessons FROM lessons;

-- ============================================================
-- ROLLBACK (only if something went wrong):
-- ALTER TABLE lessons ADD COLUMN energy_level varchar(20) NOT NULL DEFAULT 'medium';
-- UPDATE lessons l
-- SET energy_level = b.energy_level
-- FROM lessons_energy_level_backup_20260814 b
-- WHERE l.id = b.id;
--
-- DROP TABLE lessons_energy_level_backup_20260814;  -- once you're happy
-- ============================================================
