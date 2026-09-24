import Link from "next/link";
import { Music, ArrowRight, CheckCircle2, Printer } from "lucide-react";
import { SITE_NAME, primaryHref, primaryLabel, COURSE_PRICE_DISPLAY, GUARANTEE_DAYS } from "@/lib/constants";
import WaitlistForm from "@/components/WaitlistForm";

export interface GuideSection {
  h: string;
  body: string[];
}

export interface GuideStep {
  title: string;
  body: string;
}

interface GuideLayoutProps {
  eyebrow: string;
  title: string;
  intro: string;
  sections?: GuideSection[];
  steps?: GuideStep[];
  checklist?: { heading: string; items: string[] }[];
  nextAction: {
    title: string;
    body: string;
  };
}

export default function GuideLayout({
  eyebrow,
  title,
  intro,
  sections = [],
  steps = [],
  checklist = [],
  nextAction,
}: GuideLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      <div className="absolute -top-24 right-[-10%] w-[420px] h-[420px] rounded-full bg-accent/[0.05] blur-3xl pointer-events-none" />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/30 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/10">
              <Music size={18} />
            </div>
            <span className="font-serif font-bold text-primary text-lg tracking-tight">
              {SITE_NAME}
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/guides"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors"
            >
              Free guides
            </Link>
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              {primaryLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Article */}
      <main className="relative z-10 flex-1">
        <article className="max-w-3xl mx-auto px-6 pt-10 sm:pt-16 pb-20">
          <div className="mb-8">
            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-primary transition-colors mb-5"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              All guides
            </Link>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright mb-3">{eyebrow}</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight leading-[1.1]">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl">{intro}</p>
          </div>

          <div className="space-y-8">
            {sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary mb-3">{s.h}</h2>
                {s.body.map((p) => (
                  <p key={p} className="text-sm sm:text-[15px] text-foreground/75 leading-relaxed mb-3">{p}</p>
                ))}
              </section>
            ))}

            {steps.length > 0 && (
              <section>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary mb-5">Step by step</h2>
                <ol className="space-y-4">
                  {steps.map((step, i) => (
                    <li key={step.title} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/15 text-primary text-sm font-bold flex items-center justify-center shrink-0 tabular-nums">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-primary">{step.title}</h3>
                        <p className="text-sm text-foreground/75 leading-relaxed mt-1">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {checklist.length > 0 && (
              <section className="grid sm:grid-cols-2 gap-6 print:grid-cols-1">
                {checklist.map((group) => (
                  <div key={group.heading} className="rounded-2xl border border-border/60 bg-card/50 p-6">
                    <p className="text-sm font-serif font-bold text-primary mb-4">{group.heading}</p>
                    <ul className="space-y-3">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-foreground/75 leading-snug">
                          <CheckCircle2 className="w-4 h-4 text-accent-bright shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {checklist.length > 0 && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <Printer className="w-3.5 h-3.5" />
                Print this page (Ctrl/Cmd + P) to keep it in your folder.
              </p>
            )}

            {/* Author box */}
            <section className="rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-7 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#356DA8] text-primary-foreground font-serif font-bold flex items-center justify-center shrink-0">
                DB
              </div>
              <div>
                <p className="text-sm font-semibold text-primary mb-1">From Daniele Buatti</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pianist, music director and vocal coach with 15+ years on the audition bench in Melbourne — the person reading your music cold, every day.
                </p>
              </div>
            </section>
          </div>

          {/* Next action → course */}
          <div className="mt-10 rounded-3xl border border-accent/25 bg-gradient-to-b from-accent/[0.08] to-accent/[0.03] p-7 sm:p-8 text-center overflow-hidden relative">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/[0.07] blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary mb-2">{nextAction.title}</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">{nextAction.body}</p>
              <a
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
              >
                {primaryLabel}
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-foreground/60 mt-3 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {COURSE_PRICE_DISPLAY} · one-time · {GUARANTEE_DAYS}-day money-back guarantee
              </p>
            </div>
          </div>

          {/* Email capture */}
          <div className="mt-8 rounded-3xl border border-border/60 bg-card/50 p-7 sm:p-8 text-center">
            <h3 className="text-lg font-serif font-bold text-primary mb-2">More free, in your inbox</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              One short, practical audition-prep tip per week. No spam, unsubscribe anytime.
            </p>
            <WaitlistForm source={`guide:${eyebrow}`} />
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="w-full pb-10 pt-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Music className="w-4 h-4 text-primary/40" />
            <span className="text-[11px] text-muted-foreground/60">{SITE_NAME}</span>
          </Link>
          <nav className="flex items-center gap-5 text-[11px] text-muted-foreground/70">
            <Link href="/guides" className="hover:text-primary transition-colors">Free guides</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </nav>
          <p className="text-[11px] text-muted-foreground/70 uppercase tracking-[0.2em]">
            Educational Resource &copy; 2026
          </p>
        </div>
      </footer>
    </div>
  );
}