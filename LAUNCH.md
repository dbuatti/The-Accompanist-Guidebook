# Launch Readiness Checklist — The Accompanist Guidebook

**Status:** Pre-launch · **Last reviewed:** 2026-08-14
**Repo:** `github.com/dbuatti/The-Accompanist-Guidebook` (branch `main`)
**Live build:** `accompanist-guidebook.vercel.app` (Connected, Ready — **0 invocations ever recorded**)
**DB:** Neon (AWS `us-east-1`, `c-8`, Postgres 17, `neondb`, 0.03/0.5 GB used)
**Owner / single admin:** `daniele.buatti@gmail.com`

Do the phases **in order**. Each phase unlocks the next. Items marked **`[code-verified]`** were read against the current source and are actually implemented in code; the rest are open.

---

## Phase 0 — Decisions (block everything downstream)

You cannot prioritize the engineering work until these two are decided. Each flip the audit backlog by ~50%.

- [ ] **Business model** — free lead-gen funnel *or* paid course.
  - *Free funnel* (audition-prep → coaching/CDs): backlog is SEO + shareability + content completion + email capture.
  - *Paid course* (Stripe checkout, gated lessons): backlog is paywall + Stripe + refund/checkout + drip + license logic.
  - Open since `AUDIT.md` Q3 (2026-08-07). **This is the next decision.**
- [ ] **Production domain** — buy + verify the brand domain. A `.vercel.app` URL isn't sellable and breaks OG/canonical/sitemap/Stripe redirects. Candidates: short brand name.

## Phase 1 — Production wiring (cheap, unblocks measurement)

- [ ] **Rotate every secret before going public.** `DATABASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `GEMINI_API_KEY` surfaced in `.env.local` this session — regenerate in Neon + Google AI Studio and put fresh values in Vercel. (`POSTGRES_URL`, `NEON_AUTH_BASE_URL` also need setting.)
- [ ] **Set Vercel env vars** (Project → Settings → Environment Variables). Vercel does *not* auto-pull `.env.local`. Without these the live build 500s on any DB call:
  - `DATABASE_URL`, `POSTGRES_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `GEMINI_API_KEY` (server)
  - `NEXT_PUBLIC_APP_URL` = your custom domain (public)
- [ ] **Connect the custom domain** (Vercel → Domains → Add) and set it as `NEXT_PUBLIC_APP_URL`. Your Vercel dashboard shows only the auto-generated `*.vercel.app` domain.
- [ ] **Enable Web Analytics** (one toggle, Free tier). You currently have **0 traffic data** — nothing to optimise against until this is on.
- [ ] **Confirm the live build actually serves** — `scripts/smoke-test.sh https://accompanist-guidebook.vercel.app` (see Phase 2). Dashboard shows 0 invocations, so nothing has ever run in production.

## Phase 2 — Smoke test (proves the wiring)

- [ ] **Run the automated smoke test** against the production URL:
  ```
  ./scripts/smoke-test.sh https://accompanist-guidebook.vercel.app
  ```
  Verifies: all 12 routes return healthy codes, admin pages 307 anonymous (guard fires), `POST /api/admin` → 401 anonymous, draft lesson titles are **not** in the anonymous `/modules` HTML, auth + favicon + robots respond. Exit 0 = good.
- [ ] **Manual end-to-end against the real app** (cannot be scripted — needs Google OAuth + YouTube):
  1. Open incognito → `/` → **Browse Modules** (see published curriculum only).
  2. **Sign in with Google** → redirected to `/modules`.
  3. Confirm a row was created in `users` (Neon → Tables → `users`) — this was a broken-signup bug; verify the fix lives in prod.
  4. Open a lesson with a video → let it play to the end → lesson auto-marks complete (checkmarks + sidebar %).
  5. Toggle "Mark complete" manually on another lesson → progress bar updates.
  6. Reload `/modules` → progress persists; `?module=<id>` deep-link survives refresh.
  7. **Logout** → returns to `/` as anonymous.
  8. As the admin email → visit each `/admin/*` page → all load, no redirects.
  9. **Run `scaffoldAuditionGuidebook` in a throwaway Neon branch first** — it is idempotent but mutates the DB; do not test on production data blind.

## Phase 3 — Content (can't sell a course whose first module is missing)

- [ ] **Publish Module 1** "Choosing Your Audition Repertoire" — currently 7 lessons, 0 published. It's the **first** thing a buyer sees; if it's hidden the course looks unfinished.
- [ ] **Resolve `[New]` duplicate lessons** — two pairs exist (`Intellectual Choice vs Vibe` vs `[New]`, `Composers Worth Knowing` vs `[New]`). The `[New]` rows hold the fuller text. Pick one of each, delete/archive the other.
- [ ] **Editorial pass on the remaining ~20 drafts** — publish, rewrite, or archive. 37/57 live is fine for a soft launch; a 50%-draft storefront is not.
- [ ] **Fix the tagline** (`src/app/page.tsx:43`) — "a video course for musical theatre **accompanists**" → "for **singers**, taught from the accompanist's bench". 5-minute change, stops you attracting the wrong audience. Also update `src/app/layout.tsx:15` metadata description ("a musical theatre learning portal" is too vague).
- [ ] **Repair broken resource links** (`AUDIT.md` S2): `musictheory.net/lessons/1` and `/lessons/4` are 404; manually confirm Sheet Music Plus (403 to bots).
- [ ] **Decide on `admin@accompanist.com` + `guest@example.com`** DB rows — delete or reconcile (N4).

## Phase 4 — Polish (all already in your Open register; not launch-blocking alone, but required for "selling publicly")

- [ ] **OG/Twitter/canonical metadata** (`src/app/layout.tsx`) — no share-preview card exists. Needs a branded 1200×630 image + production URL.
- [ ] **`sitemap.xml`** (add `app/sitemap.ts`) and tighten `robots.txt` to disallow `/admin`, `/api`, `/auth`.
- [ ] **Row-Level Security** — off on all tables, zero policies. Not an active hole (all DB access flows through guarded server actions) but it's the last line of defense for a paid product.
- [ ] **Gemini rate limit** — admin-only now, but no per-minute cap. Once public, anyone who steals/leverages a session could spam the paid API.
- [ ] **Accessibility** (`AUDIT.md` S6): `VideoPlayer` hardcodes `id="yt-player"` (duplicate IDs break `label` targeting), icon-only buttons lack `aria-label`s, very small / faded helper text likely fails WCAG AA.
- [ ] **Sign-up bot protection** — `ensureUserExists` now auto-creates a row on every new session; there's no captcha or rate-limit. Matters the moment you're public.
- [ ] **Free tier → paid tier budget** before launch week — Vercel Free function limits + Neon cold-start compute will choke on real sign-ups. Plan the upgrade.
- [ ] *(Optional)* **Video resume** — `saveVideoProgress` / `progress.last_position` are dead code; learners lose place mid-lesson. Caveat: `progress.completed_at` defaults to now, so wiring resume naively auto-completes lessons — fix the schema first.

## Phase 5 — Repeatable audit (read-only, before each public push)

Before every `main` push that touches the data layer or auth, re-run:
1. `pnpm lint` (0 errors; `any` warnings are carry-over, not blockers)
2. `pnpm build` (Next typecheck + build — ~13 routes)
3. `./scripts/smoke-test.sh https://accompanist-guidebook.vercel.app`
4. The 9-step manual e2e above.

---

### Legend
- **`[code-verified]`** = read against current source (2026-08-14).
- **`[audit]`** = from `AUDIT.md` (2026-08-07); may be stale — re-check before acting.
- **`[new]`** = surfaced this session.