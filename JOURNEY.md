# Learner Journey Map — The Accompanist Guidebook

A factual, step-by-step walkthrough of a learner's path through the product, based on code review and runtime checks of the current build (Next.js 14.2.35, Neon Auth, Drizzle + Neon Postgres).

Reference points in the UI code: `src/app/page.tsx` (landing), `src/app/auth/[path]/page.tsx` (sign-in), `src/app/modules/page.tsx` (course), `src/components/VideoPlayer.tsx` (video), `src/app/actions.ts` (server actions).

---

## 1. Arrival (Cold visitor, no session)

- **Landing** (`/`, `src/app/page.tsx`). Server-rendered hero: brand, tagline, two CTAs — **Browse Modules** (→ `/modules`) and **Sign In** (→ `/auth/sign-in`). Three feature highlights. Footer line: "Educational Resource © 2026".
- If the visitor already has a valid session cookie, `useEffect` redirects them straight to `/modules` (page.tsx:13-17).
- The visitor is anonymous → no redirect; they see the hero.

## 2. Browse the course without an account

- **Curriculum** (`/modules`, `src/app/modules/page.tsx`). Anonymous visitors are served the **full course tree including unpublished/draft lessons** — `getCourseContent(isAdmin || !session)` at page.tsx:80 passes `true` when there is no session, returning every lesson regardless of `isPublished` (verified in the rendered DOM and in the server-action response).
- The "All Modules" view lists all 3 levels, 13 modules, and all lessons. Selecting a module (sidebar, or a card/lesson row) opens `ModuleContent`: module hero, lesson count, jump-to pills, then each lesson with its notes, resources, and video player where a `videoUrl` exists.
- Anonymous visitors see "Sign in to track your progress" / "Sign in" links. They cannot mark lessons complete (the action no-ops without a session).

## 3. Sign up / sign in

- **Sign-in** (`/auth/sign-in`, `src/app/auth/[path]/page.tsx` + `src/components/AuthContainer.tsx`). Google social button + Neon Auth email/password UI (`NeonAuthUIProvider`, `@neondatabase/auth`). After sign-in the provider redirects to `/modules` (layout.tsx:27).
- The page also offers "browse modules without signing in".
- On success, Neon Auth sets a session cookie handled by `api/auth/[...path]/route.ts` (`auth.handler()`).

### ⚠️ Step 3 caveat (runtime-verified failure)
New sign-ups create a Neon Auth session but **no row in the `users` table** — the `ensureUserExists` action exists (actions.ts:16) but is never called (call removed in commit `44e4a84`). `progress.user_id` has a FK to `users.id`, so any progress write from a brand-new account fails with `violates foreign key constraint "progress_user_id_fkey"` (verified via a rolled-back insert). Existing users (created before the change) work fine.

## 4. First module / first lesson

- Sign-in lands the learner on `/modules`. `fetchData` loads `getProgress(user.id)` (existing users only) and the published course tree. Sidebar shows per-module and overall course progress (percent + "x of y lessons completed").
- Selecting a module shows: module header ("Module" pill, title, progress bar), jump-to pills per lesson, then each lesson as an article with:
  - **Video** — `VideoPlayer` (YouTube iframe API) rendered only when `lesson.videoUrl` is non-empty. 14 of 37 published lessons currently have a video.
  - **Notes** — markdown-lite rendered as headings/bullets/callouts.
  - **Resources** — external links (currently attached to 16 DB resources).
  - **Mark complete** — manual toggle for logged-in users (green check when done).
- **Auto-complete**: when a YouTube video ends (`onStateChange === 0`, VideoPlayer.tsx:58), `onComplete` calls the same toggle, marking the lesson complete automatically.

## 5. Progress state

- Completion state lives in the `progress` table (`userId`, `lessonId`, `completedAt`, `lastPosition`; unique per user+lesson). Rendered from `getProgress` on load; toggled by `toggleLessonProgress` (actions.ts:92).
- Video position (`lastPosition`) is **not** saved or restored — `saveVideoProgress` (actions.ts:79) is never called, and every `VideoPlayer` instance passes `initialTime={0}` and a no-op `onProgress` (modules/page.tsx:386, 440).

## 6. Moving between modules / leaving

- Module switching is sidebar-driven; selection updates `?module=<id>` in the URL (page.tsx:52-57), so the current module is preserved on reload/back (read at page.tsx:64-71).
- **Logout** ("Exit") calls `authClient.signOut()` and redirects to `/`.
- On small screens (< `lg`), the sidebar becomes a slide-over drawer (`Sheet`); the mobile header shows the current module title and a menu button.

## 7. Admin paths (not part of the learner journey)

- Six admin pages (`/admin`, `/admin/tree`, `/admin/users`, `/admin/resources`, `/admin/assistant`, `/admin/modules`) are **client-side-only protected**: no session → redirect to `/auth/sign-in`; session but email not in `ADMIN_EMAILS` → redirect to `/modules` (verified: anonymous headless Chrome requests land on the sign-in page).
- The `/api/admin` route (Gemini content sync) is the only path with a **server-side** guard (401 when unauthenticated, verified).
- All 30 server actions in `src/app/actions.ts` (including `deleteUser`, `updateUser`, `publishAllLessons`, `createLesson`, `restructureCourse`, `scaffoldAuditionGuidebook`) have **no server-side session/admin check** and are directly invocable via `Next-Action` POST (verified: anonymous read of the course tree returned 200; mutating action IDs are present in the public JS bundle).

## 8. Session expiry

- If a session expires, `authClient.useSession()` returns no session: admin pages redirect to sign-in; the modules page reverts to the anonymous view (drafts exposed, progress hidden). Not runtime-tested (no test credentials available) — code-reviewed only.

---

### Verification status legend
- **Verified**: confirmed by running (HTTP/DB/DOM checks).
- **Code-reviewed**: confirmed by reading source, not exercised at runtime.
- **Not tested**: could not be exercised (no test account/browser credentials).
