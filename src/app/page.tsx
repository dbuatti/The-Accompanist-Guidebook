"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Music, Scissors, Mic, Piano, ArrowRight, CheckCircle2, Sparkles, Layers, Quote } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import PromoCountdown from "@/components/PromoCountdown";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/modules");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" />
    );
  }

  if (session) return null;

  const primaryHref = paymentLink || "/modules";
  const primaryLabel = "Get Full Access";

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
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 border border-border bg-card/60 hover:border-primary/25 text-foreground/80 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15 hover:shadow-lg hover:-translate-y-0.5"
            >
              {primaryLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center">
        <div className="text-center space-y-8 max-w-3xl mx-auto px-6 pt-16 sm:pt-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10 text-primary text-[11px] font-semibold uppercase tracking-[0.15em]">
              <Sparkles className="w-3 h-3" />
              For Musical Theatre Performers
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-primary tracking-tight leading-[1.08] [font-feature-settings:'liga'_0,'calt'_0] [letter-spacing:0.01em]">
              From first audition
              <span className="block text-foreground">to final callback.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              A video course for musical theatre performers — choosing your songs, cutting and preparing your music, delivering tempo, and collaborating with the pianist and panel like a pro.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 pt-2">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              {primaryLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-muted-foreground/70">
              Already own the course?{" "}
              <Link href="/auth/sign-in" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-5 pt-4 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 3 levels of training</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Self-paced video lessons</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Progress tracking</span>
          </div>

          <PromoCountdown />
        </div>

        {/* What you'll master — soft periwinkle band */}
        <section className="w-full mt-16 sm:mt-20 bg-periwinkle/40 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 justify-center mb-10">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-bright/60" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright">What you&apos;ll master</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-bright/60" />
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: Scissors, n: "01", title: "Cut & Prepare", desc: "Choose and cut your songs so any pianist can sight-read them on the spot." },
                { icon: Mic, n: "02", title: "Audition Ready", desc: "Walk into any room calm and prepared — clear tempo, smooth handover, real presence." },
                { icon: Piano, n: "03", title: "Collaboration", desc: "Work with the pianist and panel as a true collaborator, from hello to last note." },
              ].map((item) => (
                <div key={item.title} className="group p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/20 hover:shadow-md hover:shadow-primary/[0.04] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center border border-primary/10 transition-colors group-hover:bg-primary/10">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-serif text-lg text-accent-bright font-semibold tabular-nums">{item.n}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-primary mb-1.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The journey — navy band */}
        <section className="w-full bg-primary relative overflow-hidden py-20 sm:py-24">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-accent/[0.06] blur-3xl pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 justify-center mb-4">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent/70" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">The journey</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent/70" />
            </div>
            <h2 className="text-center text-3xl sm:text-4xl font-serif font-bold text-primary-foreground mb-3">A structured path, built for the room</h2>
            <p className="text-center text-sm text-primary-foreground/70 max-w-xl mx-auto mb-12 leading-relaxed">
              Three levels, each one building the skills that read as professional the moment you walk into the audition room.
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { n: "01", name: "Foundations", desc: "Choose the right songs and prepare your music so it's easy to read and hard to get wrong under pressure." },
                { n: "02", name: "Preparation", desc: "Cut and annotate with confidence, deliver your tempo, and hand your music over with a handover that lands." },
                { n: "03", name: "Collaboration", desc: "Work with full presence alongside the pianist and panel, and handle whatever the room throws at you." },
              ].map((item) => (
                <div key={item.n} className="group p-6 rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07] hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-3.5 h-3.5 text-accent/80" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent/80">Level {item.n}</span>
                  </div>
                  <h3 className="text-base font-serif font-semibold text-primary-foreground mb-1.5">{item.name}</h3>
                  <p className="text-xs text-primary-foreground/70 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet your instructor */}
        <section className="w-full py-20 sm:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 justify-center mb-4">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-bright/60" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright">Meet your instructor</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-bright/60" />
            </div>

            <div className="grid md:grid-cols-[300px_1fr] gap-10 items-start mt-10">
              {/* Headshot */}
              <div className="mx-auto w-full max-w-[300px]">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-[#356DA8]">
                  <div className="absolute inset-0 sheet-music-texture opacity-10" />
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
                  <Image
                    src="/headshot.jpeg"
                    alt="Daniele Buatti"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm font-serif font-bold text-primary">Daniele Buatti</p>
                  <p className="text-xs text-muted-foreground">Pianist · Vocal Coach · Music Director</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary leading-tight">
                  Your auditions, from the accompanist&apos;s bench
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed">
                  I&apos;m Daniele Buatti — a pianist, music director, vocal coach, and embodiment practitioner from Melbourne. I&apos;ve spent fifteen years at the piano in audition rooms: reading cuts, setting tempos, and watching hundreds of performers walk in — and out. This course is built so you walk in feeling prepared, calm, and entirely in control.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "15+ years across musical theatre — as an audition pianist, music director, and vocal coach.",
                    "Vocal coach — helping singers find technique, interpretation, and presence for auditions and shows.",
                    "Embodiment practitioner — trained in kinesiology, helping performers stay calm, present, and grounded under pressure.",
                    "Educator at heart — making the practical side of performing clear, simple, and doable.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground/80 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-accent-bright shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/[0.06] px-5 py-4">
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    When your accompanist has thirty seconds to sight-read your cut, everything hinges on how you&apos;ve prepared it. That&apos;s the perspective this course is built from.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid sm:grid-cols-2 gap-5 mt-12">
              {[
                {
                  quote: "Daniele's guidance transformed my audition experience. I walked in confident and prepared, knowing exactly what to expect.",
                  name: "Performer",
                  role: "Musical Theatre",
                },
                {
                  quote: "Working with Daniele helped me feel grounded and present in the room. The preparation made all the difference.",
                  name: "Student",
                  role: "Voice & Performance",
                },
              ].map((t) => (
                <div key={t.name} className="p-6 rounded-2xl bg-card border border-border/40 hover:border-primary/15 transition-all">
                  <Quote className="w-5 h-5 text-accent-bright/60 mb-3" />
                  <p className="text-sm text-foreground/80 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-xs mt-4">
                    <span className="font-semibold text-primary">{t.name}</span>
                    <span className="text-muted-foreground"> · {t.role}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <div className="w-full max-w-4xl mx-auto px-6 pb-24">
          <div className="relative rounded-3xl border border-accent/20 bg-accent/[0.06] px-8 py-12 sm:py-14 text-center overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/[0.08] blur-3xl pointer-events-none" />
            <div className="relative">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright mb-3 block">Ready when you are</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-3">Get full access to the complete course</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                Every module, lesson, and resource — yours for life, at your own pace. Launch pricing ends soon.
              </p>
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                {primaryLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="mt-8">
                <PromoCountdown />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full pb-10">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-primary/40" />
              <span className="text-[11px] text-muted-foreground/60">The Audition Guidebook</span>
            </div>
            <p className="text-[11px] text-muted-foreground/40 uppercase tracking-[0.2em]">
              Educational Resource &copy; 2026
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
