import CopyDocumentButton from "@/components/admin/CopyDocumentButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Compass, ShieldCheck, Building2, Database, Cloud, KeyRound, Cpu, Video, Sparkles } from "lucide-react";

export const metadata = {
  title: "Blueprint · Admin · The Accompanist Guidebook",
  description: "Architecture and business product analysis (admin only).",
  robots: { index: false, follow: false },
};

function Pill({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary/70" />
      {children}
    </span>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-14 scroll-mt-8 border-b border-border/40 pb-2 font-serif text-xl font-bold text-primary">
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-7 font-serif text-base font-semibold text-primary/90">{children}</h3>;
}

export default function BlueprintPage() {
  return (
    <div className="max-w-4xl mx-auto">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/[0.06] via-card/40 to-transparent p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/5 text-primary">
              <Compass className="h-3.5 w-3.5" /> Admin only
            </Badge>
            <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-700">
              Snapshot in time
            </Badge>
            <Badge variant="outline" className="border-border/60 text-muted-foreground">
              14 August 2026
            </Badge>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">The Blueprint</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A single, self-contained document that explains how The Accompanist Guidebook works as a piece of
            software <em>and</em> as a product. Written so that handing this page — and nothing else — to a fresh
            Claude session gives it a complete, accurate mental model of the app: what it is, who it serves, where
            every piece lives, and which decisions are still open.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill icon={Building2}>Business product analysis</Pill>
            <Pill icon={Cpu}>Technical architecture</Pill>
            <Pill icon={Cloud}>Hosting &amp; deployment</Pill>
            <Pill icon={Database}>Where data lives</Pill>
            <Pill icon={ShieldCheck}>Access control</Pill>
          </div>
          <div className="mt-6">
            <CopyDocumentButton targetId="blueprint-document" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <Card className="mt-8 bg-card/40">
        <CardContent className="space-y-2 p-5 text-xs text-muted-foreground">
          <p className="font-mono font-semibold uppercase tracking-wider text-primary/70">How to read this page</p>
          <p>
            <strong className="text-foreground">Verified in current source</strong> means the claim was read against
            the code on disk today. <strong className="text-foreground">Audit snapshot</strong> means the figure is
            from <code className="rounded bg-muted px-1 py-0.5">AUDIT.md</code> (dated 2026-08-07) and represents the
            state at that audit pass — some items listed as blockers there have since been fixed (see B15).
          </p>
        </CardContent>
      </Card>

      <article id="blueprint-document" className="prose-text mt-10">
        {/* ============================================================= */}
        {/* PART A — BUSINESS & PRODUCT SNAPSHOT                          */}
        {/* ============================================================= */}
        <h2 className="sr-only">Part A</h2>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/50">Part A</p>
        <h2 className="border-b border-border/40 pb-2 font-serif text-2xl font-bold text-primary">
          Business &amp; Product Snapshot
        </h2>

        <SectionTitle id="a-identity">A1 · Identity &amp; naming</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody className="divide-y divide-border/40">
              <FactRow k="Public brand">
                <strong>The Accompanist Guidebook</strong> — appears in the landing hero, the course sidebar, the
                sign-in page, and the root document title.
              </FactRow>
              <FactRow k="Internal / course codename">
                <strong>Audition Guidebook</strong> — used inside the course-scaffolding code, the Gemini lesson
                prompts, and the Notion workspace name. The product was developed under this name before the
                public-facing brand was settled.
              </FactRow>
              <FactRow k="Package name">
                <code className="rounded bg-muted px-1.5 py-0.5">accompanist-guidebook</code> (in
                <code className="rounded bg-muted px-1.5 py-0.5">package.json</code>)
              </FactRow>
              <FactRow k="Repository">
                <code className="rounded bg-muted px-1.5 py-0.5">github.com/dbuatti/The-Accompanist-Guidebook</code>,
                branch <code className="rounded bg-muted px-1.5 py-0.5">main</code>
              </FactRow>
              <FactRow k="Operator / founder / instructor">
                Daniele Buatti — professional Music Director, Audition Pianist, and Voice Coach. The single admin is
                the Google account <code className="rounded bg-muted px-1.5 py-0.5">daniele.buatti@gmail.com</code>.
              </FactRow>
              <FactRow k="Legal footer shown to users">
                &ldquo;Educational Resource © 2026&rdquo; (landing page footer)
              </FactRow>
            </tbody>
          </table>
        </div>

        <SectionTitle id="a-what">A2 · What this product is</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          The Accompanist Guidebook is a web-based video course platform — a learning portal that teaches musical
          theatre performers how to audition from the vantage point of the person sitting at the piano. The curriculum
          is delivered as a three-tier hierarchy (Levels &rarr; Modules &rarr; Lessons), each lesson pairing an embedded
          YouTube video, written lesson notes (a small Markdown dialect), and curated external resources. Learners sign
          in to track their progress through the course; completion can be marked manually or fires automatically when a
          lesson video ends.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          Behind the learner-facing course sits a one-person admin back-office: a content management studio for
          authoring and publishing lessons, a curriculum-tree editor, a members manager, and an AI copilot that uses
          Google Gemini to draft lesson notes from the instructor&apos;s private brain-dumps. It is, in effect, a
          single-operator education business with software purpose-built to make that one operator productive.
        </p>

        <SectionTitle id="a-purpose">A3 · Purpose</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          To give musical theatre performers one authoritative, practical reference for everything on the
          &ldquo;music side&rdquo; of auditioning — the parts that are usually invisible to the singer and known only
          to the accompanist: how to choose and source repertoire, how to mark a clean cut any pianist can sight-read
          cold, how to annotate and present sheet music, how to deliver tempo, how to talk to an accompanist, and how
          to conduct the choreography of the audition room. The purpose is to convert that tacited, hard-won
          professional knowledge into a repeatable skill set any performer can learn.
        </p>

        <SectionTitle id="a-mission">A4 · Mission</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          To democratise the accompanist&apos;s professional knowledge — knowledge normally earned only by playing
          thousands of auditions — and hand it to the singer, so every performer can treat the accompanist as a
          collaborator rather than a threat, and so the audition room becomes calmer, kinder, and more musical. The
          mission is teaching, and the product is the most efficient vehicle to deliver that teaching at scale while
          keeping one human creator at its centre.
        </p>

        <SectionTitle id="a-goals">A5 · What it&apos;s set out to do</SectionTitle>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet>Standardise audition music preparation end to end — repertoire selection, sheet-music sourcing, cutting, annotation, scanning, digitising, and physical presentation.</Bullet>
          <Bullet>Teach the audition &ldquo;handover&rdquo; as a choreography: approaching the piano, walking the accompanist through the music, delivering tempo, choosing an introduction, and exiting gracefully.</Bullet>
          <Bullet>Add a home-rehearsal layer (backing tracks) so singers can practise delivering tempo and entries without booking a live pianist.</Bullet>
          <Bullet>Track per-learner progress through the curriculum with manual and automatic completion, so a singer always knows where they are.</Bullet>
          <Bullet>Give the single operator an ADHD-friendly authoring studio (focus timer, writing templates, brain-dump scratchpad, AI lesson generator, dopamine celebrations) so one person can sustainably produce a full video course.</Bullet>
          <Bullet>Act as a credible, attributable front door for the instructor&apos;s wider practice — backing tracks, voice coaching, and a weekly in-person Audition Prep Workshop.</Bullet>
        </ul>

        <SectionTitle id="a-audience">A6 · Audience &amp; positioning</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          The primary audience is the <strong>auditioning musical theatre singer</strong> — the person who walks into
          the room and hands music to a pianist they have never met. The content is unambiguously written for that
          person: every module — choosing repertoire, marking cuts, annotating sheet music, delivering tempo, talking
          to the accompanist — is something the <em>singer</em> does. The guidebook is named for the
          <em> accompanist</em> because the instructor <em>is</em> the accompanist: the whole differentiator is that
          the course is taught from the piano bench.
        </p>
        <Card className="mt-4 border-amber-500/20 bg-amber-500/[0.04]">
          <CardContent className="p-4 text-xs leading-relaxed text-amber-800/90">
            <strong className="font-semibold">Analyst flag — tagline / content mismatch:</strong> the landing-page
            hero reads &ldquo;A complete video course for musical theatre <em>accompanists</em>&rdquo;, but the content
            is for <em>singers</em> working <em>with</em> accompanists. As written, that copy would attract the wrong
            audience. Recommend re-cutting the tagline to something like &ldquo;A complete video course for the
            musical theatre singer, taught from the accompanist&apos;s bench&rdquo; before public launch (see A9).
          </CardContent>
        </Card>

        <SectionTitle id="a-structure">A7 · Product structure snapshot</SectionTitle>
        <SubTitle>Curriculum shape (verified in source + audit snapshot)</SubTitle>
        <ul className="mt-2 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><strong>3 Levels.</strong> Level 1 — Foundations &amp; Mindset · Level 2 — Practical Preparation · Level 3 — Advanced Collaboration. Set by the one-click <code className="rounded bg-muted px-1.5 py-0.5">scaffoldAuditionGuidebook</code> action.</Bullet>
          <Bullet><strong>13 Modules.</strong> M1 Choosing Your Audition Repertoire · M2 Where to Source Sheet Music · M3 What Your Sheet Music Should Look Like · M4 Basic Music Terminology · M5 How to Cut Your Music · M6 How to Annotate and Mark Up Your Music · M7 Physical Preparation of Your Music · M8 How to Scan and Digitise Your Music · M9 How to Deliver Tempo · M10 Approaching and Talking to Your Accompanist · M11 Walking Into the Audition Room · M12 Backing Tracks and Home Rehearsal · M13 Common Mistakes — What Not to Do.</Bullet>
          <Bullet><strong>~57 Lessons</strong> (audit snapshot), of which <strong>~37 published</strong> and <strong>~20 draft</strong>. The first module (M1) was entirely unpublished at audit time and two pairs of <code className="rounded bg-muted px-1.5 py-0.5">[New]</code>-suffixed duplicate lessons await a content decision.</Bullet>
          <Bullet><strong>14 lessons</strong> currently carry a live, embeddable YouTube <code className="rounded bg-muted px-1.5 py-0.5">video_url</code> (audit-verified via oEmbed). <strong>~16 resource rows</strong> attach curated external links to lessons.</Bullet>
        </ul>
        <SubTitle>Per-learner state</SubTitle>
        <ul className="mt-2 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet>Sign-in required to write progress. Completion is stored per (user, lesson) and can be toggled manually or auto-set when a video ends.</Bullet>
          <Bullet>Module- and course-level progress percentages render in the sidebar for signed-in learners.</Bullet>
          <Bullet>Anonymous visitors can browse the <em>published</em> curriculum without an account (see B7 for the post-fix gating behaviour).</Bullet>
        </ul>
        <SubTitle>Admin / authoring surface</SubTitle>
        <ul className="mt-2 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><Resolved />Single unified Curriculum editor (<code className="rounded bg-muted px-1.5 py-0.5">/admin</code>) replaced the three overlapping pages that used to edit the same lesson/module data (Content, Module Studio, Tree). One tree pane (levels/modules/lessons — create, rename, delete, move, reorder, publish) plus one context-aware detail pane (module settings, or the full lesson editor) — no more guessing which page does what.</Bullet>
          <Bullet>Lesson editor: video-production pipeline (<code className="rounded bg-muted px-1.5 py-0.5">not_started → scheduled → filmed → edited → uploaded</code>), filming dates, block-based rich-text notes, resources, cliffnotes, writing templates, Gemini AI generation, and an AI-prompt copy tool — plus a members manager and a Tools menu for bulk actions (publish all, restructure course, fix structure, sync from source, scaffold).</Bullet>
        </ul>
        <p className="mt-3 text-xs italic text-muted-foreground">
          Account base at audit: ~8 real users, 1 test admin (<code>admin@accompanist.com</code>), and an orphan
          placeholder (<code>guest@example.com</code>). Cleanup decision pending.
        </p>

        <SectionTitle id="a-business">A8 · Business model &amp; maturity</SectionTitle>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><strong>Stage:</strong> pre-launch. The most recent engineering pass hardened server-side auth, restored progress-tracking for new sign-ups, and produced a pre-launch audit — i.e. the team is on the launch runway, not past it.</Bullet>
          <Bullet><strong>Revenue model:</strong> not implemented. The entire published curriculum is currently open with no paywall. The implied path is a paid course plus a funnel into the instructor&apos;s services (backing tracks, voice coaching, the weekly Wednesday Audition Prep Workshop). Whether to gate content is an explicit open decision.</Bullet>
          <Bullet><strong>Cost profile:</strong> deliberately cheap to run — Next.js on Vercel, Neon serverless Postgres over an HTTP driver (cheap per-request), YouTube hosting the video bandwidth off-platform, and a paid Gemini API used only in admin authoring. Marginal cost per learner is effectively zero; the real cost is one person&apos;s time producing content (offset by AI tooling).</Bullet>
          <Bullet><strong>Key-person dependency:</strong> high. Everything — content, branding, admin — sits with one operator. The course content partly exists only as <code className="rounded bg-muted px-1.5 py-0.5">adminNotes</code> brain-dumps and the scenario transcripts; this is both the product&apos;s soul and its continuity risk.</Bullet>
          <Bullet><strong>Build tooling origin:</strong> the app was scaffolded with Dyad (a local-first Next.js app builder) and then iterated by hand; the <code className="rounded bg-muted px-1.5 py-0.5">.dyad/</code> workspace directory is gitignored.</Bullet>
        </ul>

        <SectionTitle id="a-questions">A9 · Open strategic questions (snapshot)</SectionTitle>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><strong>Pricing / gating:</strong> is this a paid course? What do non-buyers see? Today everything published is open — this is the central commercial decision before launch.</Bullet>
          <Bullet><strong>Domain &amp; brand presentation:</strong> no production domain is wired into the repo; a branded share image and OG/Twitter/canonical tags are needed before social sharing looks credible.</Bullet>
          <Bullet><strong>Content finalisation:</strong> the ~20 drafts (including the unpublished first module and the <code>[New]</code> duplicate lessons) need an editorial pass before public launch.</Bullet>
          <Bullet><strong>Analytics &amp; privacy:</strong> no instrumentation exists yet (no page views, no conversion events, no error reporting). The choice of analytics provider depends on a privacy stance that has not been stated.</Bullet>
          <Bullet><strong>Sign-up protection:</strong> new accounts now persist a row automatically; there is no spam / bot protection, which matters the moment the site is public.</Bullet>
        </ul>

        {/* ============================================================= */}
        {/* PART B — TECHNICAL ARCHITECTURE                               */}
        {/* ============================================================= */}
        <p className="mt-14 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/50">Part B</p>
        <h2 className="border-b border-border/40 pb-2 font-serif text-2xl font-bold text-primary">
          Technical Architecture
        </h2>

        <SectionTitle id="b-stack">B1 · Stack at a glance</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Layer</th>
                <th className="py-2 pr-4 font-semibold">Technology</th>
                <th className="py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <FactRow k="Framework">Next.js 14.2.35, App Router (React Server Components + Server Actions). <code>reactStrictMode</code> on.</FactRow>
              <FactRow k="Language">TypeScript 5.5 across the app; SQL/Postgres for data; a Markdown-lite dialect for lesson notes.</FactRow>
              <FactRow k="UI">React 18.3, Tailwind 3.4, shadcn/ui (Radix primitives), lucide-react, sonner (toasts), vaul, cmdk, recharts.</FactRow>
              <FactRow k="Data">Neon serverless Postgres (AWS us-east-1, <code>c-8</code>) via the <code>@neondatabase/serverless</code> HTTP driver + Drizzle ORM 0.45.</FactRow>
              <FactRow k="Auth">Neon Auth (<code>@neondatabase/auth</code>) — Google OAuth + email/password, signed session cookie.</FactRow>
              <FactRow k="AI">Google Gemini via <code>@google/genai</code>, model <code>gemini-2.5-flash</code>, server-side only.</FactRow>
              <FactRow k="Video">YouTube IFrame API, driven by an in-house <code>VideoPlayer</code> component.</FactRow>
              <FactRow k="Client state">TanStack React Query 5 (provider wired in <code>providers.tsx</code>); React Hook Form + Zod available.</FactRow>
              <FactRow k="Tooling">pnpm (lockfile + workspace); ESLint 9 flat config; tailwindcss-animate.</FactRow>
              <FactRow k="VCS">Git on <code>main</code>; origin <code>github.com/dbuatti/The-Accompanist-Guidebook</code>.</FactRow>
            </tbody>
          </table>
        </div>

        <SectionTitle id="b-languages">B2 · Languages &amp; data formats</SectionTitle>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><strong>TypeScript / TSX</strong> is the only application programming language. There is no separate backend service language — Next.js Route Handlers and Server Actions <em>are</em> the API.</Bullet>
          <Bullet><strong>Postgres SQL</strong> is the storage layer, written and queried through Drizzle&apos;s query builder (no raw SQL in app code; no Drizzle migration files are checked in — schema is defined in <code>src/lib/schema.ts</code>).</Bullet>
          <Bullet><strong>Markdown-lite</strong> is an ad-hoc dialect rendered by <code>parseNotesToBlocks</code> on the modules page: H1–H3 headings, bullet/numbered lists, blockquotes, <code>---</code> dividers, and inline <code>**bold**</code>, <code>*italic*</code>, <code>`code`</code>. Lesson notes stored freeform in <code>lessons.notes</code>.</Bullet>
        </ul>

        <SectionTitle id="b-repo">B3 · Repository, build &amp; tooling</SectionTitle>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet>Single repository, single Next.js app (no monorepo). Source lives under <code>src/</code>; build output under <code>.next/</code> (gitignored).</Bullet>
          <Bullet>Scripts (verified green at audit): <code>pnpm dev</code>, <code>pnpm build</code> (Next typecheck + build — ~12 routes), <code>pnpm lint</code> (0 errors; 124 <code>no-explicit-any</code> warnings), <code>pnpm start</code>.</Bullet>
          <Bullet>No test runner is configured (no Jest/Vitest/Playwright). <code>AUDIT.md</code> and <code>JOURNEY.md</code> in the repo root are the closest artefacts to a verification record.</Bullet>
        </ul>

        <SectionTitle id="b-hosting">B4 · Hosting &amp; deployment</SectionTitle>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><strong>Application / compute:</strong> Next.js 14, intended for Vercel — a <code>vercel.json</code> is present (minimal; schema reference only). Server Actions and Route Handlers run on Vercel&apos;s serverless runtime per Next.js defaults.</Bullet>
          <Bullet><strong>Database:</strong> Neon serverless Postgres in AWS <code>us-east-1</code> (compute <code>c-8</code>), database <code>neondb</code>, accessed through the Neon <em>pooler</em> endpoint over the HTTP serverless driver — each request is a short-lived HTTP fetch, which suits serverless compute and avoids connection pooling headaches.</Bullet>
          <Bullet><strong>Auth:</strong> Neon Auth, hosted on the same Neon project (<code>NEON_AUTH_BASE_URL</code>); the session cookie is signed with <code>NEON_AUTH_COOKIE_SECRET</code>.</Bullet>
          <Bullet><strong>AI:</strong> Google Gemini API, keyed server-side by <code>GEMINI_API_KEY</code> (never shipped to the browser).</Bullet>
          <Bullet><strong>Video:</strong> YouTube — all lesson and wrap-up videos are YouTube URLs embedded via the IFrame API. Bandwidth and transcoding are off-platform.</Bullet>
          <Bullet><strong>Static assets &amp; fonts:</strong> <code>public/</code> ships a favicon and <code>robots.txt</code> (no sitemap or OG image yet). Fonts (Inter for body, Playfair Display for headings) are fetched via <code>next/font/google</code> and resolved at build time.</Bullet>
        </ul>

        <SectionTitle id="b-domain">B5 · Domain status</SectionTitle>
        <Card className="mt-4 border-amber-500/20 bg-amber-500/[0.04]">
          <CardContent className="p-4 text-sm leading-relaxed text-foreground/85">
            <p>
              <strong>There is no production domain wired into the repository.</strong> In the local environment
              <code className="mx-1 rounded bg-muted px-1.5 py-0.5">NEXT_PUBLIC_APP_URL</code> is
              <code className="mx-1 rounded bg-muted px-1.5 py-0.5">http://localhost:3000</code>, and it doubles as the
              NeonAuthUIProvider <code>baseURL</code> and the redirect origin after Google sign-in. A production origin
              must be set as <code>NEXT_PUBLIC_APP_URL</code> at deploy time on Vercel (and reused for future
              canonical / OG / sitemap URLs). The GitHub repository is the only network identity currently tied to the
              project: <code>github.com/dbuatti/The-Accompanist-Guidebook</code>.
            </p>
          </CardContent>
        </Card>

        <SectionTitle id="b-data">B6 · Where the data lives</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          Persisted state lives in <strong>one Neon Postgres database</strong>, six tables, defined in
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5">src/lib/schema.ts</code>. Drizzle manages access through
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5">src/lib/db.ts</code>. Media is external: videos on
          YouTube, sheet-music source links point to Musicnotes / Sheet Music Plus / Scribd. No files are stored by the
          app.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Table</th>
                <th className="py-2 pr-4 font-semibold">Key columns</th>
                <th className="py-2 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <FactRow k="users">id (uuid), email (unique), name, role (default <code>user</code>), created_at</FactRow>
              <FactRow k="progress">user_id &rarr; users.id, lesson_id, last_position, completed_at, unique(user, lesson)</FactRow>
              <FactRow k="levels">id, title, display_order</FactRow>
              <FactRow k="modules">level_id &rarr; levels.id (set null on delete), title, wrapUpVideoUrl, is_published, display_order</FactRow>
              <FactRow k="lessons">module_id &rarr; modules.id (cascade), title, video_url, duration, notes, admin_notes, cliffnotes, is_published, has_video, video_status, filming_date</FactRow>
              <FactRow k="resources">lesson_id &rarr; lessons.id (cascade), title, url, description, display_order</FactRow>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs italic text-muted-foreground">
          Notable: <code>lessons.admin_notes</code> holds the instructor&apos;s private brain-dumps and is the source
          material for AI lesson generation; it is never rendered to learners. <code>progress.last_position</code> is
          the intended video-resume field but is <strong>not currently wired</strong> (see B15). Row-Level Security is
          off on all tables with zero policies — a defense-in-depth gap, not an active hole today because all DB access
          flows through guarded server actions.
        </p>

        <SectionTitle id="b-auth">B7 · Authentication &amp; access control</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          Auth is Neon Auth. The Route Handler at <code>api/auth/[...path]/route.ts</code> exposes
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5">auth.handler()</code> for OAuth callbacks and session
          refresh; the client SDK is created in <code>lib/auth/client.ts</code>; server-side helpers live in
          <code>lib/auth/index.ts</code>. Sign-in offers Google social login plus Neon&apos;s email/password UI, and
          redirects to <code>/modules</code> on success.
        </p>
        <SubTitle>Authorization (verified in current source — post the audit&apos;s hardening pass)</SubTitle>
        <ul className="mt-2 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><strong>Admin list:</strong> <code>ADMIN_EMAILS = [&quot;daniele.buatti@gmail.com&quot;]</code> in <code>lib/admin.ts</code>; <code>isAdmin(email)</code> is a case-insensitive membership check. This list is the sole source of truth for admin rights — the <code>users.role</code> column is informational, not used for authorization.</Bullet>
          <Bullet><strong>Page-level guard (server-side):</strong> <code>app/admin/layout.tsx</code> is an async Server Component that calls <code>getCurrentUser()</code> and redirects to <code>/auth/sign-in</code> if there is no session, and to <code>/modules</code> if the user is not an admin. Every <code>/admin/*</code> route — including this Blueprint page — inherits this server-side guard.</Bullet>
          <Bullet><strong>Action-level guards (server-side):</strong> <code>requireUser()</code> and <code>requireAdmin()</code> sit at the top of every mutating server action. Reads like <code>getCourseContent()</code> derive <code>isAdmin</code> from the session and return published-only lessons to non-admins; drafts are visible only to the admin.</Bullet>
          <Bullet><strong>API guard (server-side):</strong> <code>POST /api/admin</code> re-checks <code>isAdmin(session.email)</code> and returns 401 if not.</Bullet>
          <Bullet><strong>Anonymous browsing:</strong> visitors without a session see the <em>published</em> curriculum only; modules with zero published lessons are hidden entirely. Progress writes no-op without a session.</Bullet>
        </ul>

        <SectionTitle id="b-flow">B8 · Request &amp; data flow</SectionTitle>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-[15px] leading-relaxed text-foreground/85 marker:text-primary/40">
          <li>Browser hits an App-Router route (e.g. <code>/modules</code>). The page server-renders, calling a Server Action.</li>
          <li>The Server Action in <code>app/actions.ts</code> runs an authorization check (<code>requireUser</code> / <code>requireAdmin</code>, or a published-only read for anonymous).</li>
          <li>The action issues a query through Drizzle, which executes over Neon&apos;s HTTP serverless driver as a short-lived fetch.</li>
          <li>Results map back into the shape the client expects; cache-validating routes call <code>revalidatePath</code> to refresh any cached pages.</li>
          <li>React renders. On the client, mutations call the same actions again (Next encodes them as POSTs with a <code>Next-Action</code> header) and toasts via sonner.</li>
          <li>Video plays directly against YouTube through the IFrame API in <code>VideoPlayer</code>; on the <code>ENDED</code> state it calls <code>toggleLessonProgress</code>, which completes the lesson for the signed-in user.</li>
        </ol>

        <SectionTitle id="b-ai">B9 · AI integration</SectionTitle>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><strong>Llama-style generation:</strong> <code>generateLessonNotes(lessonId)</code> (admin-only) builds a prompt from the lesson&apos;s title, public <code>notes</code>, and private <code>adminNotes</code>, calls <code>gemini-2.5-flash</code> with the server key, and writes the returned Markdown back to <code>lessons.notes</code>.</Bullet>
          <Bullet><strong>Manual copilot:</strong> the <code>/admin/assistant</code> page hand-builds the same style of tailored prompt and offers a one-click copy, to be pasted into Claude or ChatGPT by hand.</Bullet>
          <Bullet><strong>Seed &amp; sync:</strong> <code>scaffoldAuditionGuidebook</code>, <code>syncLessonContent</code>, and <code>restructureCourse</code> read the in-repo source-of-truth in <code>app/actions/lessonContent.ts</code> to create / align lessons matched on module + lesson title — so the curriculum can be re-baselined from the codebase without an external DB migration.</Bullet>
        </ul>

        <SectionTitle id="b-video">B10 · Video</SectionTitle>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><code>VideoPlayer.tsx</code> loads the YouTube IFrame API, creates a <code>YT.Player</code> per iframe, and exposes completion (state <code>0</code>) and a 5-second progress poll.</Bullet>
          <Bullet>Both lesson and module wrap-up videos use it. URLs may carry <code>&amp;v=</code> or <code>v=</code> params — an internal regex extracts the 11-character video ID. YouTube is single-sourced for all playback; there is no uploaded media.</Bullet>
        </ul>

        <SectionTitle id="b-ui">B11 · Frontend &amp; design system</SectionTitle>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet>Design language: a <strong>&ldquo;Warm Cream / Sheet Music&rdquo;</strong> palette (cream background, deep-brown primary, gold accent) with a dotted sheet-music texture on landing/auth, Inter for body text and Playfair Display for serif headings. Generous rounding (<code>--radius: 0.75rem</code>).</Bullet>
          <Bullet>All primitives are shadcn/ui on Radix, installed locally under <code>src/components/ui/</code> (do not edit per <code>AI_RULES.md</code>); bespoke components live in <code>src/components/</code> and <code>src/components/admin/</code>.</Bullet>
          <Bullet>Responsive: a fixed 320px sidebar collapses into a slide-over <code>Sheet</code> drawer below <code>lg</code>. A single admin shell (<code>AdminNav</code>) tabs across the back-office.</Bullet>
        </ul>

        <SectionTitle id="b-admin">B12 · Admin surface</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Route</th>
                <th className="py-2 font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <FactRow k="/admin">Course content studio — lesson authoring, publishing, and the ADHD-friendly authoring tools.</FactRow>
              <FactRow k="/admin/tree">Curriculum tree — inline rename / move / publish across Levels, Modules, Lessons.</FactRow>
              <FactRow k="/admin/users">Member management — list users, change roles, delete users.</FactRow>
              <FactRow k="/admin/resources">Quick links to the instructor&apos;s external workspaces (Notion, Google Docs/Slides, Claude).</FactRow>
              <FactRow k="/admin/assistant">AI Copilot — one-click scaffolder + copy-to-clipboard lesson prompt generator.</FactRow>
              <FactRow k="/admin/modules">Module / resource editor — lesson notes, resources, wrap-up video.</FactRow>
              <FactRow k="/admin/blueprint">This page — architecture &amp; product snapshot.</FactRow>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs italic text-muted-foreground">
          Of these, the four that appear in <code>AdminNav</code> are Course Content, Curriculum Tree, Manage Users,
          and Resources (plus this Blueprint). The Assistant and Module Studio pages are reachable by URL; the nav was
          deliberately simplified in an earlier commit.
        </p>

        <SectionTitle id="b-files">B13 · File / source map</SectionTitle>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-border/40 bg-card/40 p-4 text-xs leading-relaxed text-foreground/80">
{`src/
├─ app/
│  ├─ layout.tsx          # root layout: fonts, NeonAuthUIProvider, Providers
│  ├─ page.tsx            # landing hero (redirects signed-in users to /modules)
│  ├─ providers.tsx       # TanStack QueryClientProvider (client)
│  ├─ actions.ts          # all Server Actions (auth-guarded)
│  ├─ actions/
│  │  └─ lessonContent.ts # in-repo curriculum source-of-truth for sync/scaffold
│  ├─ modules/page.tsx    # learner course view (sidebar + module content)
│  ├─ auth/[path]/page.tsx# sign-in / sign-up / reset (Neon Auth UI)
│  ├─ admin/              # admin shell (server-guarded via layout.tsx)
│  │  ├─ layout.tsx       # server-side getCurrentUser + isAdmin gate
│  │  ├─ page.tsx · tree · users · resources · assistant · modules · blueprint
│  └─ api/
│     ├─ admin/route.ts      # POST: admin bulk actions (isAdmin-guarded, 401)
│     └─ auth/[...path]      # auth.handler() GET/POST (Neon Auth)
├─ components/
│  ├─ ui/                 # shadcn/ui primitives (do not edit)
│  ├─ admin/              # bespoke admin components + CopyDocumentButton
│  ├─ AdminNav.tsx · AuthContainer.tsx · VideoPlayer.tsx
├─ lib/
│  ├─ db.ts · schema.ts   # Drizzle client + table definitions
│  ├─ admin.ts            # ADMIN_EMAILS + isAdmin()
│  └─ auth/               # client.ts · server.ts · index.ts (getCurrentUser/requireUser/requireAdmin)
├─ hooks/ · utils/        # use-mobile hook, toast helpers, shared utils
└─ globals.css            # warm-cream/sheet-music design tokens`}
        </pre>

        <SectionTitle id="b-env">B14 · Environment &amp; secrets</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Variable</th>
                <th className="py-2 pr-4 font-semibold">Scope</th>
                <th className="py-2 font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <FactRow k="DATABASE_URL">server</FactRow>
              <FactRow k="POSTGRES_URL">server</FactRow>
              <FactRow k="NEON_AUTH_BASE_URL">server</FactRow>
              <FactRow k="NEON_AUTH_COOKIE_SECRET">server</FactRow>
              <FactRow k="GEMINI_API_KEY">server</FactRow>
              <FactRow k="NEXT_PUBLIC_APP_URL">public</FactRow>
            </tbody>
          </table>
        </div>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet>Credentials live in <code>.env.local</code> and are <strong>gitignored</strong> (pattern <code>*.local</code>); no secrets are committed.</Bullet>
          <Bullet><code className="rounded bg-muted px-1.5 py-0.5">GEMINI_API_KEY</code> is read by a client constructed at module load in <code>actions.ts</code>; it is used only in admin actions and never exposed to the browser. (A nit: it is instantiated eagerly even for non-AI requests — see B15.)</Bullet>
          <Bullet>If any secret has ever been shared or pushed outside this machine, rotate it; the admin contact (the operator) can do so from Neon and Google AI Studio.</Bullet>
        </ul>

        <SectionTitle id="b-issues">B15 · Known issues &amp; risk register</SectionTitle>
        <SubTitle>Resolved since the audit was written (verified in current source)</SubTitle>
        <ul className="mt-2 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><Resolved />Server actions are now auth-guarded: every mutating action calls <code>requireAdmin()</code>; progress actions call <code>requireUser()</code>.</Bullet>
          <Bullet><Resolved />Admin pages are guarded <em>server-side</em> via <code>app/admin/layout.tsx</code> (redirect, not client-only).</Bullet>
          <Bullet><Resolved />Anonymous browsing returns published lessons only — drafts are admin-only.</Bullet>
          <Bullet><Resolved />New sign-ups persist a <code>users</code> row again (<code>ensureUserExists</code> restored and wired on <code>/modules</code>), so progress writes no longer fail on the foreign key.</Bullet>
        </ul>
        <SubTitle>Still open (from AUDIT; not addressed in code as of this read)</SubTitle>
        <ul className="mt-2 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><Open />Row-Level Security is off on all tables with no policies — a defense-in-depth gap, given any future client-facing DB path.</Bullet>
          <Bullet><Open />No Open Graph / Twitter / canonical metadata, no <code>sitemap.xml</code>; <code>robots.txt</code> allows everything (including <code>/admin</code>).</Bullet>
          <Bullet><Open />Accessibility: <code>VideoPlayer</code> hardcodes <code>id="yt-player"</code> (duplicate IDs when multiple players render); icon-only buttons missing <code>aria-label</code>; very small / low-contrast helper text.</Bullet>
          <Bullet><Open />Video resume is dead code (<code>saveVideoProgress</code> / <code>lastPosition</code> never wired; every player passes <code>initialTime={0}</code>). Caveat: <code>progress.completed_at</code> defaults to now, so wiring resume naively would auto-complete lessons — fix schema first.</Bullet>
          <Bullet><Open />Data hygiene: <code>has_video</code> flag inconsistent (~51 flagged, only ~14 have a URL); Level 1 <code>display_order</code> skips 2; orphan <code>guest@example.com</code> and test <code>admin@accompanist.com</code> rows; 124 <code>no-explicit-any</code> warnings; unused <code>react-player</code> dependency.</Bullet>
          <Bullet><Open />Internal workspace links (personal Notion / Google Docs / Claude chat) currently ship in the <code>/admin/resources</code> client bundle — the route is admin-guarded, but the URLs still reach any browser that fetches that page&apos;s JS.</Bullet>
          <Bullet><Open />No instrumentation: no analytics (page views, conversion) and no error reporting.</Bullet>
          <Bullet><Open />Content: the first module is entirely unpublished and ~20 drafts (including <code>[New]</code> duplicates) await an editorial decision.</Bullet>
          <Bullet><Open />Trivial: duplicate <code>revalidatePath(&quot;/modules&quot;)</code> calls in <code>publishAllLessons</code> / <code>fixCourseStructure</code>; the Gemini client is instantiated at module load rather than lazily.</Bullet>
        </ul>

        <SectionTitle id="b-run">B16 · How to run locally</SectionTitle>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-[15px] leading-relaxed text-foreground/85 marker:text-primary/40">
          <li><code>pnpm install</code></li>
          <li>Populate <code>.env.local</code> (see B14 — the values already exist in this workspace).</li>
          <li><code>pnpm dev</code> — Next dev server on <code>http://localhost:3000</code></li>
          <li><code>pnpm lint</code> and <code>pnpm build</code> to verify (both green at audit). No test suite exists.</li>
        </ol>

        {/* ============================================================= */}
        {/* PART C — CONDENSED BRIEF                                       */}
        {/* ============================================================= */}
        <p className="mt-14 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/50">Part C</p>
        <h2 className="border-b border-border/40 pb-2 font-serif text-2xl font-bold text-primary">
          Condensed brief — paste to Claude
        </h2>
        <Card className="mt-4 border-primary/15 bg-primary/[0.03]">
          <CardContent className="space-y-3 p-6 text-[15px] leading-relaxed text-foreground/85">
            <p>
              <strong>The Accompanist Guidebook</strong> is a pre-launch, one-operator video course platform that
              teaches musical theatre singers how to audition — taught from the vantage point of the audition pianist
              (instructor Daniele Buatti). Built with <strong>Next.js 14 (App Router, TypeScript)</strong> using
              <strong> Server Actions</strong> as the API, a <strong>Neon serverless Postgres</strong> database accessed
              via the <strong>Drizzle ORM</strong> + Neon HTTP driver, <strong>Neon Auth</strong> (Google + email) for
              accounts, <strong>YouTube IFrame API</strong> for videos, and <strong>Google Gemini</strong>
              (<code>gemini-2.5-flash</code>) for admin lesson drafting. It is intended to deploy on <strong>Vercel</strong>;
              no production domain is wired yet.
            </p>
            <p>
              The data model is six tables (<code>users, progress, levels, modules, lessons, resources</code>) in a
              single Postgres DB. The curriculum is <strong>3 levels → 13 modules → ~57 lessons</strong> (~37 published /
              ~20 draft, ~14 with live video). Learners track completion (manual or auto on video end). Authz is by an
              <code>ADMIN_EMAILS</code> allow-list; admin pages and all mutating actions are server-side guarded, and
              anonymous users see published lessons only. Row-Level Security is off (defense-in-depth gap, not an
              active hole). The biggest open business decisions are the pricing/gating model, the production domain +
              SEO metadata, and finalising the ~20 draft lessons before public launch.
            </p>
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-[11px] text-muted-foreground/40 uppercase tracking-[0.2em]">
          End of blueprint
        </p>
      </article>
    </div>
  );
}

function FactRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <tr className="align-top">
      <td className="py-2.5 pr-4 font-medium text-primary/80">{k}</td>
      <td className="py-2.5 text-foreground/85">{children}</td>
    </tr>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
      <span>{children}</span>
    </li>
  );
}

function Resolved() {
  return (
    <span className="mr-1 inline-flex items-center rounded-full border border-green-500/20 bg-green-500/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-green-700">
      Resolved
    </span>
  );
}

function Open() {
  return (
    <span className="mr-1 inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700">
      Open
    </span>
  );
}