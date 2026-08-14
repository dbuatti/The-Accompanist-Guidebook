-- ============================================================
-- Fix: has_video flag inconsistency (AUDIT.md N2)
-- The Accompanist Guidebook
-- ============================================================
-- Problem:  37 lessons have has_video = true but an EMPTY video_url.
--           The UI keys off videoUrl truthiness, so the flag is
--           cosmetic and misleading. Flips them to false.
-- Verified pre-run (14 Aug 2026): 57 total, 14 correct=true,
--           37 wrong (true+empty), 0 wrong (false+non-empty).
-- Safe:     Idempotent (WHERE clause prevents no-op writes).
--           Reversible (rollback statement at the bottom).
-- Backup:   A snapshot table is created before the UPDATE.
-- Run in:   Neon SQL Editor (project: neondb, branch: production)
--           OR — safer — create a Neon preview branch first,
--           test there, then run on production.
-- ============================================================

-- BEGIN TRANSACTION;
--  ^ un-comment for a single atomic run (Neon SQL Editor supports it)

-- 1) DRY RUN — see exactly what will change. Run this first, alone.
--    Expected: 37 rows, every one has_video=true, should_be=false.
SELECT
    id,
    title,
    has_video,
    (video_url <> '') AS should_be
FROM lessons
WHERE has_video <> (video_url <> '')
ORDER BY title;

-- 2) BACKUP — cheap snapshot of the columns we're about to change.
--    Safe to re-run (IF NOT EXISTS). Drop it after you've confirmed.
CREATE TABLE IF NOT EXISTS lessons_has_video_backup_20260814 AS
SELECT id, title, has_video AS old_has_video, video_url, created_at
FROM lessons;

-- 3) THE FIX — one statement, idempotent.
UPDATE lessons
SET has_video = (video_url <> '')
WHERE has_video <> (video_url <> '');
-- Expected: UPDATE 37

-- 4) VERIFY — should show 0 mismatches, 14 true / 43 false, 57 total.
SELECT
    COUNT(*) FILTER (WHERE has_video <> (video_url <> '')) AS remaining_mismatches,
    COUNT(*) FILTER (WHERE has_video = true)              AS true_count,
    COUNT(*) FILTER (WHERE has_video = false)             AS false_count,
    COUNT(*)                                              AS total
FROM lessons;

-- COMMIT;
--  ^ un-comment if you opened with BEGIN TRANSACTION.

-- ============================================================
-- ROLLBACK (only if something went wrong):
-- UPDATE lessons l
-- SET has_video = b.old_has_video
-- FROM lessons_has_video_backup_20260814 b
-- WHERE l.id = b.id;
--
-- DROP TABLE lessons_has_video_backup_20260814;  -- once you're happy
-- ============================================================