# CURRICULUM — Charter & Scope Lock

**Chat owner:** This session (`danielebuatti`) is the *sole* responsible party for every curriculum matter in this app. Nothing else (guides, landing page, marketing, auth flows unrelated to content, or non-curriculum code paths) is touched without an explicit ask.

## What "Curriculum" covers here
- **Levels** — `src/lib/types.ts` `CourseLevel`, `src/server/services/curriculum.ts` `levels`, `db.select().from(levels)`.
- **Modules** — `src/lib/types.ts` `CourseModule`, `modules.slug`, `displayOrder`, `isPublished`, `moduleNumber`.
- **Lessons** — `src/lib/types.ts` `CourseLesson`, `lessons.title`, `lessons.notes`, `lessons.adminNotes`, `lessons.videoUrl`, `duration`, `hasVideo`, `videoStatus`, `filmingDate`, `resources`.
- **Resources** — `resources` table keyed by `lessonId`; added via `addResource(lessonId, title, url, description)`.
- **Source of truth** — `src/app/actions/lessonContent.ts` (`lessonContent` array). This is the in-repo scaffold/sync source used by `scaffoldAuditionGuidebook()`, `syncLessonContent()`, and `restructureCourse()`. Public-facing preview (`getPublicCurriculumPreview()`) shows only published modules + lesson titles.
- **Admin UI** — `/admin/tree`, `/admin/modules`, `/admin/lessonEditor`, Tools menu "Scaffold Curriculum", "Merge Duplicates", "Toggle Module Visibility", "Publish All Lessons".
- **API actions** — defined in `src/app/actions.ts`: `getPublicCourseStats`, `getPublicCurriculumPreview`, `getCourseContent`, `getLevelsOnly`, CRUD for levels/modules/lessons/resources/progress, mergeDuplicateLessons, fixCourseStructure, stripModuleNumberPrefixes, etc.

## Boundaries (enforced by this chat)
- Only curriculum content (levels/modules/lessons/resources/notes/adminNotes/video metadata).
- No landing page, guides, marketing/paywall decisions, or non-curriculum feature changes unless asked.
- All mutations go through the admin API actions; admin-only requires Neon Auth (`@neondatabase/auth`).
- Keep existing Tailwind/shadcn/ui styles untouched; don't edit shared component libraries.

## Current audit snapshot (read from `src/server/services/curriculum.ts`)
- **Levels:** 3 (public stats fall back to 3).
- **Modules:** 13 published across levels; total module rows queried via `getPublicCurriculumPreview()` include display order and lessons.
- **Lessons:** ~49 published; non-published/draft lessons exist for anonymous visitors (see JOURNEY.md § Curriculum).
- **Sync pipeline:** `scaffoldAuditionGuidebook()`, `syncLessonContent()`, `restructureCourse()` all read `app/actions/lessonContent.ts` to re-baseline curriculum without external DB migration.
- **Paywall model:** Entire curriculum currently open (no gating); revenue funnel (backing tracks marketplace, subscription) is a separate product decision.

## Ownership conventions
- Every change passes `pnpm lint` and `pnpm build`.
- Never modify files outside the listed paths without an explicit request.
- When unsure about an action affecting more than one row, ask before editing.

*Charter created 2026-11-14 by danielebuatti (chat owner).*
