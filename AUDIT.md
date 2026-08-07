# Pre-Launch Audit — The Accompanist Guidebook

**Date:** 2026-08-07 · **Phase 1 (read-only):** no code changes made.
**Stack:** Next.js 14.2.35 · Neon Auth (`@neondatabase/auth`) · Drizzle ORM + Neon Postgres · YouTube (custom player) · Gemini (`@google/genai`) · Tailwind/shadcn.
**Verification:** `tsc --noEmit` ✅ · `pnpm lint` ✅ (0 errors / 124 `no-explicit-any` warnings) · `pnpm build` ✅ (12 routes) · live dev server HTTP + headless-Chrome DOM checks ✅ · direct DB queries via read-only/rolled-back scripts ✅ · direct server-action POST test ✅.

Verification terms used: **Verified** (ran it) · **Code-reviewed** (read source, not executed) · **UNVERIFIED** (could not exercise).

---

## Summary

| Severity | Count |
|---|---|
| BLOCKER | 4 |
| SHOULD FIX | 6 |
| NICE TO HAVE | 9 |
| TRIVIAL (one-liners, batch-approve) | 3 |

**Bottom line:** compile/lint/build are green and the public content renders, but **there is no server-side access control anywhere in the data layer**. Every server action is anonymously invocable, all admin pages rely on client-side redirects only, anonymous visitors see the full course including draft lessons, and new sign-ups cannot persist progress. These are launch-blocking.

---

## BLOCKERS

### B1 — All 30 server actions are unauthenticated and directly invocable
- **Area:** Auth/accounts, Security (Sections 1, 4)
- **What's wrong:** No action in `src/app/actions.ts` performs any session or admin check (no `auth.getSession()`, no `isAdmin()`; the only `ADMIN_EMAILS` usage is role assignment in the never-called `ensureUserExists`). Combined with **RLS being OFF on all tables** (see S5), this is a fully unprotected data layer. Demonstrated: an anonymous `POST /modules` with a `Next-Action` header returned HTTP 200 with full course data including draft lesson content. The IDs for every mutating action (`deleteUser`, `updateUser`, `publishAllLessons`, `createLesson`, `deleteLesson`, `restructureCourse`, `scaffoldAuditionGuidebook`, `generateLessonNotes`, `syncLessonContent`, …) are shipped in the public JS bundle of `/modules`.
- **Where:** `src/app/actions.ts` (all 30 exports, incl. lines 39, 48, 58, 92, 175–313, 326, 377, 684, 750, 880–1004). No `src/middleware.ts`.
- **Proposed fix:** Add a shared `requireAdmin()`/`requireUser()` guard (session from `auth.getSession()` + `ADMIN_EMAILS`) at the top of every mutating action; apply a read-only-user check to `getAllUsers`/`getCourseContent`. ~0.5–1 day.
- **Risk of fixing:** Low. Pure server-side gating; verified `isAdmin`/`getSession` pattern already exists in `src/app/api/admin/route.ts:7-9`.

### B2 — Admin pages are protected client-side only
- **Area:** Auth/accounts (Section 1)
- **What's wrong:** All six admin pages gate on a `useEffect` that calls `router.push()` when unauthenticated/non-admin. The redirect works in practice (verified: anonymous requests land on sign-in), but it protects nothing at the data layer — the underlying server actions are open (see B1), and any user who extracts an action ID can read/write everything. Per your rule: client-side-only protection on a paid course = BLOCKER, flagging every instance.
- **Where:** `src/app/admin/page.tsx:128-132` · `src/app/admin/tree/page.tsx:59-63` · `src/app/admin/users/page.tsx:41-45` · `src/app/admin/resources/page.tsx:30-34` · `src/app/admin/assistant/page.tsx:28-32` · `src/app/admin/modules/page.tsx:113-117`
- **Proposed fix:** Move the guard server-side: `getAdminPageData()`/layout wrapper that returns `notFound()` or redirects, plus B1's action guards. ~half day.
- **Risk of fixing:** Low–medium (must keep admin UX working; redirect timing changes).

### B3 — Anonymous visitors receive the full course, including 20 draft lessons
- **Area:** Cold-visitor path, Content (Sections 3, 5)
- **What's wrong:** `getCourseContent(isAdmin || !session)` at `src/app/modules/page.tsx:80` passes `true` when there's no session — i.e. anonymous browsing bypasses the published-only filter. Verified: an anonymous headless-Chrome render of `/modules` shows draft lessons (`What Is Audition Repertoire?`, `Building Six Pieces`, `Intellectual Choice vs Vibe [New]`, `Composers Worth Knowing [New]`), and the action POST in B1 returned draft lesson text. Full lesson rows (including `adminNotes` editorial brain-dumps) are shipped in the payload, though not rendered.
- **Where:** `src/app/modules/page.tsx:80`; filter logic `src/app/actions.ts:121-159`.
- **Proposed fix:** Pass `isAdmin` only (`getCourseContent(isAdmin)`) — `isAdmin` already implies a session. Optionally add `?preview=1` for admin preview. One line + re-verify.
- **Risk of fixing:** Low. Changes what anonymous visitors see (intended behavior per the "browse without signing in" link — but that link presumably means *published* content, not drafts).

### B4 — New sign-ups cannot save progress (FK failure)
- **Area:** Progress/learning state (Section 2)
- **What's wrong:** `ensureUserExists` (actions.ts:16) is defined but never called (its call was removed in commit `44e4a84`). New Neon Auth sign-ins get a session but no `users` row; `progress.user_id` is FK-constrained to `users.id`, so `toggleLessonProgress` fails with `violates foreign key constraint "progress_user_id_fkey"` for any account created after that commit. Verified with a rolled-back insert.
- **Where:** `src/app/actions.ts:92-118` (toggle), `:16` (unused helper), `src/lib/schema.ts:13`.
- **Proposed fix:** Re-invoke `ensureUserExists(session.user.id, session.user.email)` after login (e.g., in the modules page fetch and in `toggleLessonProgress`/`getProgress` when the user has no row), or sync users on the Neon Auth webhook. ~half day.
- **Risk of fixing:** Low. Existing users unaffected; new users start tracking.

---

## SHOULD FIX

### S1 — First module of the course is fully unpublished (content gap)
- **Area:** Content integrity (Section 3)
- **What's wrong:** "Choosing Your Audition Repertoire" (Level 1) has **7 lessons, 0 published** — all DRAFT. Because `getCourseContent` drops modules with zero published lessons, learners never see the opening module of the course. The 7 drafts include two pairs of near-duplicates ("Intellectual Choice vs Vibe" vs "[New]", "Composers Worth Knowing" vs "[New]") where the `[New]` rows hold the fuller text. 20 of 57 lessons overall are unpublished drafts.
- **Where:** DB `lessons`/`modules`; filter `src/app/actions.ts:127-159`; scaffolding source `src/app/actions.ts:424-450`.
- **Proposed fix:** Content decision needed (see Questions Q1): finalise the `[New]` versions, delete/archive originals, publish. ~content authoring, not code.
- **Risk of fixing:** Content-only; no code risk.

### S2 — Broken/blocked external resource links
- **Area:** Content integrity (Section 3)
- **What's wrong:** Link checks (HTTP): `https://www.musictheory.net/lessons/1` → 404 and `https://www.musictheory.net/lessons/4` → 404 (dead pages; sibling lessons 10/11/13/14/42 all 200). `https://www.sheetmusicplus.com` → 403 for HEAD and GET with a browser UA (likely bot-block; needs a manual human check). All 14 lesson YouTube videos verified live & embeddable (oEmbed 200).
- **Where:** `resources` table rows 8 and 1/2 (musictheory.net/lessons/1 is "The Staff", /lessons/4 is "Note Reading"); "Sheet Music Plus" row.
- **Proposed fix:** Update/remove the two 404 rows; manually confirm Sheet Music Plus from a real browser. ~15 min.
- **Risk of fixing:** None.

### S3 — No social/share metadata, no sitemap, robots allows everything
- **Area:** Cold-visitor path, SEO (Sections 5, 7)
- **What's wrong:** `layout.tsx` metadata is title + description only — **no OG/Twitter/canonical/theme-color**. No `sitemap.xml`. `public/robots.txt` allows every user-agent on every path. Result: links shared on socials/WhatsApp render as plain URLs with no preview card; search engines get no sitemap.
- **Where:** `src/app/layout.tsx:13-16`; `public/robots.txt:1-14`.
- **Proposed fix:** Add OG/Twitter tags (need a branded 1200×630 image + production URL via `NEXT_PUBLIC_APP_URL`), add `app/sitemap.ts` (or `public/sitemap.xml`), consider disallowing `/admin`, `/api`, `/auth` in robots. ~half day.
- **Risk of fixing:** Low. Cosmetic/SEO only.

### S4 — Unauthenticated Gemini calls = open cost/abuse vector
- **Area:** Instrumentation/security (Sections 4, 7)
- **What's wrong:** `generateLessonNotes` (actions.ts:326), `scaffoldAuditionGuidebook` (:377), `syncLessonContent` (:684) call the paid Gemini API with the server key. With B1 unfixed, anyone can spam them → API cost and DB pollution (they also `UPDATE` lesson rows).
- **Where:** `src/app/actions.ts:326-374, 377-683, 684-749`.
- **Proposed fix:** Fold into B1 guards (admin-only), plus a simple per-minute rate limit.
- **Risk of fixing:** Low.

### S5 — RLS disabled on all tables, zero policies
- **Area:** Auth/accounts, Data (Section 1)
- **What's wrong:** All 6 tables (`users`, `progress`, `levels`, `modules`, `lessons`, `resources`) have `row_security` OFF and no policies. Today all access flows through server actions (so B1 is the practical hole), but there is no last-line-of-defense and no per-user row isolation if any client-facing DB path ever appears (e.g., a Neon DB copy exposed via `@neondatabase/serverless` from a client bundle).
- **Where:** Neon DB (schema); `src/lib/db.ts`.
- **Proposed fix:** Defense-in-depth: enable RLS with user-scoped policies (requires switching to per-session/authenticator DB roles). Larger architectural change — schedule after B1.
- **Risk of fixing:** Medium (Neon auth integration); do not attempt in Phase 1.

### S6 — Accessibility gaps in the course UI
- **Area:** Mobile/a11y (Section 6)
- **What's wrong:** (code-reviewed)
  - `VideoPlayer` hardcodes `id="yt-player"` on every iframe — a module with 3 videos renders 3 elements with the same ID (invalid DOM, breaks `label`/anchor targeting). `src/components/VideoPlayer.tsx:97`.
  - Icon-only buttons lack accessible names: mobile menu (modules/page.tsx:248), mobile logout (:258), sidebar "Exit" has text; desktop header `Publish` has text. Screen-reader users get unlabeled buttons.
  - Heavy use of `text-[10px]`–`text-[11px]` at `muted-foreground/30`–`/60` contrast (e.g. curriculum lesson list :625-629, sidebar footer) — likely fails WCAG AA.
- **Where:** as above.
- **Proposed fix:** unique `id` per player (e.g. `yt-player-${lesson.id}`), `aria-label`s on icon buttons, bump the smallest/most faded text contrast. ~half day.
- **Risk of fixing:** Low. Mobile layout itself (drawer navigation, responsive headings) is code-appropriate; visual check at 375px saved to `/tmp/mobile-*.png` — see UNVERIFIED.

---

## NICE TO HAVE

- **N1 — Video resume is dead code:** `saveVideoProgress`/`lastPosition` are never wired; all `VideoPlayer` calls pass `initialTime={0}` and a no-op `onProgress` (modules/page.tsx:386, 440; admin/modules/page.tsx:551). Learners lose position mid-lesson. Note: if you wire it, `progress.completed_at` has `defaultNow()` (schema.ts:16), so saving a position would auto-mark the lesson complete — adjust the schema first.
- **N2 — `has_video` flag is inconsistent:** 51 lessons flag `has_video=true`, but only 14 have a non-empty `video_url`; the UI keys off `videoUrl` truthiness, so the flag is cosmetic/misleading (DB `lessons`).
- **N3 — Level 1 module order gap:** `display_order` skips 2 (order 1,3,4,5) — invisible to learners (numbers are computed, modules/page.tsx:581) but a data-cleanliness item; `fixCourseStructure` would close it but also rewrites titles, so do it by hand.
- **N4 — Stray/incorrect account data:** `guest@example.com` (uuid `0000…0000`) is orphaned — nothing references it (`grep guest` → none). `admin@accompanist.com` (role `admin`) is a test row; DB `role` column is unused for authz (ADMIN_EMAILS wins). Clean up or reconcile.
- **N5 — Section 9 carry-over (unchanged since last session):** 124 `@typescript-eslint/no-explicit-any` warnings; 28 unused shadcn `ui/` components in `node_modules` tree. No current failure (lint 0 errors, build green). Suggest a batch cleanup after launch.
- **N6 — Unused dependency:** `react-player` (package.json:60) is never imported (custom VideoPlayer is used). Remove.
- **N7 — Internal workspace links shipped in the admin client bundle:** `src/app/admin/resources/page.tsx:43-75` hardcode a Claude AI chat URL, two personal Notion pages, and two Google Docs. Not secrets, but internal workspaces are exposed to anyone reading the bundle. Move to DB/env and keep admin-only.
- **N8 — Admin Assistant not reachable from nav:** `AdminNav.tsx` has 4 tabs; `/admin/assistant` isn't one. Discoverability only.
- **N9 — No instrumentation (Section 7 detail):** confirmed absent (no Sentry/analytics/GA in `package.json` or `src`). Recommended minimal set: Vercel Analytics or Plausible for page views; custom events on `signup`, `module_open`, `lesson_complete`, `video_start`; error reporting via Sentry or Next's `error.tsx` + console capture to a log drain; set a conversion goal "new user completes ≥1 lesson".

---

## TRIVIAL (one-liners, no risk — batch approval)

- `src/app/actions.ts:946` and `:996` — duplicate `revalidatePath("/modules")` (appears twice in both `publishAllLessons` and `fixCourseStructure`). Delete the duplicate line.
- `src/app/actions.ts:15` — stray comment "--- User Management Actions ---" is fine; the real item: remove the dead `ensureUserExists` once B4's fix lands (or keep it if you reuse it for B4).
- `src/app/actions.ts:13` — `const ai = new GoogleGenAI(...)` is instantiated at module load even though Gemini is only used in admin actions; lazy-instantiate to avoid an eager env read in prod.

---

## Section-by-section notes

- **1 Auth/accounts:** Neon Auth (Google + email/password) is wired correctly (`AuthContainer`, `api/auth/[...path]`). All authz gaps are covered by B1/B2/B4/S5. Google OAuth end-to-end and password-reset flow **UNVERIFIED** (no test credentials).
- **2 Progress/learning state:** Completion tracking works for the 8 pre-existing real users (58 progress rows across 18 lessons). B4 breaks it for new users. Resume is dead (N1). Mid-session session-expiry behavior **UNVERIFIED** (code-reviewed only).
- **3 Content integrity:** 57 lessons / 13 modules / 3 levels. 20 drafts, S1 gap, S2 dead links, all videos valid. All modules marked published. No `wrapUpVideoUrl` set on any module (wrap-up section simply won't render — verify intent).
- **4 Functionality sweep:** All 12 routes 200; unknown route 404 (HTTP-level). Loading spinner, empty state, `?module=` deep-link all code-present. Interactive flows (sign-up, toggling, admin CRUD) gated on B1 — the only runtime-login test path is blocked without credentials. `POST /api/admin` unauth → 401 ✅; `GET` → 405 ✅.
- **5 Cold-visitor path:** landing → Browse Modules shows **full course incl. drafts (B3)** → optional Sign In. No paywall anywhere; no OG preview (S3); robots allows all (S3).
- **6 Mobile/a11y:** Responsive code present (drawer nav < `lg`, stacked layout). Visual 375px check **UNVERIFIED** (screenshots saved to `/tmp/mobile-{landing,modules,signin}.png`; no viewport-capable tool/model image support in this session). A11y items in S6.
- **7 Instrumentation:** none (N9). API route and admin API are guarded; the rest of the surface relies on B1 fixes.
- **8 Journey map:** see `JOURNEY.md`.
- **9 Carry-over:** N5/N6 carry over; everything from the previous cleanup (tsc/lint/build green, env-ified Gemini key, admin API guard, dead code removal) is confirmed still green.

---

## UNVERIFIED items (could not exercise in Phase 1)

- Google OAuth sign-in/up and Neon password-reset end-to-end (no credentials).
- Logged-in progress toggling for a brand-new account (B4's failure was proven at the DB layer instead).
- Session expiry mid-lesson (client cookie flow).
- Visual layout/contrast at 375px (screenshots available: `/tmp/mobile-*.png`).
- Sheet Music Plus reachability (403 for bots; needs a human browser).

---

## QUESTIONS FOR DANIELE

1. **Content:** Which lessons are final? There are 20 unpublished drafts, including `[New]` duplicates of published lessons (e.g., "Intellectual Choice vs Vibe" vs "Intellectual Choice vs Vibe [New]"). Should the `[New]` versions replace the originals, and should "Choosing Your Audition Repertoire" (7 drafts, first module) be published before launch?
2. **Anonymous browsing:** Is "browse without signing in" intended to show only *published* content (my recommendation — currently it shows everything incl. drafts, B3), or truly everything?
3. **Paywall/gating model:** Is this a paid course? If so, which experience should non-buyers get (currently the entire curriculum is open)? This determines whether B2/B3 stay BLOCKER.
4. **Account sync:** When should new sign-ups become trackable — auto-create the `users` row on first login (restore `ensureUserExists`)? Any concern about sign-up bots?
5. **Completion model:** OK that finishing a video auto-marks the lesson complete, in addition to the manual "Mark complete"? And do you want video-position resume (N1) before launch?
6. **Hosting/domain:** What's the production URL for OG tags and `NEXT_PUBLIC_APP_URL`? Any branded share image available?
7. **Cleanup:** OK to remove the `guest@example.com` placeholder and the `admin@accompanist.com` test account? Keep the internal Claude/Notion/Google links in `admin/resources` (N7) or move them to env/DB?
8. **Instrumentation:** Any privacy constraints (GDPR) affecting which analytics to add (Plausible vs Vercel vs GA4)?
