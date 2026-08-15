"use client";

import Link from "next/link";
import {
  Music,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  PlayCircle,
  Layers,
  Infinity as InfinityIcon,
} from "lucide-react";
import PromoCountdown from "@/components/PromoCountdown";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

export default function PaywallGate({ hasSession }: { hasSession: boolean }) {
  const primaryHref = paymentLink || "/auth/sign-in";
  const primaryLabel = paymentLink ? "Get Full Access" : "Sign in to view your course";

  const included = [
    { icon: Layers, title: "Three levels of training", desc: "Foundations → Preparation → Collaboration, built in a logical sequence." },
    { icon: PlayCircle, title: "Self-paced video lessons", desc: "Watch on your schedule, rewind anytime, work at your own pace." },
    { icon: InfinityIcon, title: "Lifetime access", desc: "One payment. Yours for life, including future lessons and resources." },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-[-10%] w-[420px] h-[420px] rounded-full bg-accent/[0.05] blur-3xl pointer-events-none" />

      {/* Nav */}
      <header className="relative z-20">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/10">
              <Music size={18} />
            </div>
            <span className="font-serif font-bold text-primary text-lg tracking-tight">
              The Audition Guidebook
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-2 border border-border bg-card/60 hover:border-primary/25 text-foreground/80 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 border border-border bg-card/60 hover:border-primary/25 text-foreground/80 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col">
        <div className="max-w-5xl mx-auto w-full px-6 pt-8 sm:pt-14 pb-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Left: what you get */}
            <div className="space-y-6 sm:space-y-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10 text-primary text-[11px] font-semibold uppercase tracking-[0.15em]">
                <Lock className="w-3 h-3" />
                Members area
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-primary tracking-tight leading-[1.1] [font-feature-settings:'liga'_0,'calt'_0] [letter-spacing:0.01em]">
                Full course access
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                The complete curriculum unlocks the moment you purchase — every module, lesson, and resource, yours to work through at your own pace.
              </p>

              <div className="space-y-4 pt-1">
                {included.map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/40">
                    <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center border border-primary/10 shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-primary">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: pricing card */}
            <div className="lg:sticky lg:top-10">
              <div className="relative rounded-3xl border border-accent/25 bg-gradient-to-b from-card to-card/40 p-7 sm:p-9 shadow-lg shadow-primary/[0.05] overflow-hidden">
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary/[0.07] blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-bright">
                    <Sparkles className="w-3.5 h-3.5" />
                    Launch offer
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary mt-3 mb-1">
                    The Audition Guidebook
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Full lifetime access to the complete course — every module, lesson, and resource.
                  </p>

                  <div className="space-y-3 mb-7">
                    {[
                      "Complete curriculum — all modules & lessons",
                      "Downloadable practice resources",
                      "Progress tracking across the course",
                      "Lifetime access + future updates",
                    ].map((line) => (
                      <div key={line} className="flex items-center gap-2.5 text-sm text-foreground/80">
                        <ShieldCheck className="w-4 h-4 text-accent-bright shrink-0" />
                        {line}
                      </div>
                    ))}
                  </div>

                  <a
                    href={primaryHref}
                    target={paymentLink ? "_blank" : undefined}
                    rel={paymentLink ? "noopener noreferrer" : undefined}
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {primaryLabel}
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <div className="mt-7 border-t border-border/40 pt-6">
                    <PromoCountdown />
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground/70 text-center mt-5">
                Already own it?{" "}
                <Link href="/auth/sign-in" className="text-primary hover:underline">Sign in</Link>
                {hasSession && (
                  <span> — or try refreshing if you just purchased.</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto w-full pb-10">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Music className="w-4 h-4 text-primary/40" />
              <span className="text-[11px] text-muted-foreground/60">The Audition Guidebook</span>
            </Link>
            <Link
              href="/"
              className="sm:hidden inline-flex items-center gap-1.5 text-[11px] text-primary hover:underline"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to home
            </Link>
            <p className="text-[11px] text-muted-foreground/40 uppercase tracking-[0.2em]">
              Educational Resource &copy; 2026
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
