import Link from "next/link";
import Image from "next/image";
import { Music, Scissors, Mic, Piano, ArrowRight, CheckCircle2, Sparkles, Layers, ShieldCheck, ChevronDown, X, Lock } from "lucide-react";
import PromoCountdown from "@/components/PromoCountdown";
import CurriculumPreview from "@/components/CurriculumPreview";
import Reveal from "@/components/Reveal";
import WaitlistForm from "@/components/WaitlistForm";
import MobileStickyCTA from "@/components/MobileStickyCTA";
import { SITE_NAME, COPYRIGHT_LINE, SUPPORT_EMAIL, primaryHref, primaryLabel, GUARANTEE_DAYS, FREE_PREVIEWS, previewHref } from "@/lib/constants";
import { CTAButton } from "@/components/CTAButton";
import SessionRedirect from "@/components/SessionRedirect";
import { getPublicCourseStats } from "@/app/actions";
import { getCoursePrice } from "@/lib/pricing";

// Re-render every 5 minutes so the live Stripe price and lesson counts stay
// current without a redeploy.
export const revalidate = 300;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";

const faqs = [
  {
    q: "Do I need to read music or play the piano?",
    a: "No. You need to know your songs and prepare your sung material — the course shows you exactly how to prepare cuts, timing and the handover so any pianist can sight-read them. Familiarity with your sheet music helps, and you'll pick up precisely what to look for.",
  },
  {
    q: "When do I get access?",
    a: "Instantly. The moment your payment is confirmed, the full course unlocks in your account — every module, lesson and resource, yours for life.",
  },
  {
    q: "How long does it take? I'm busy.",
    a: "Lessons are short, focused videos with written notes, and you work at your own pace. Finish a module in an afternoon, or stretch it across a week of audition-season evenings.",
  },
  {
    q: "I'm a beginner — is this for me?",
    a: "Yes. The course is built in three levels — Foundations, Preparation, Collaboration — so you progress from picking your songs right through to owning the room. Working performers get just as much from it: the preparation skills last for every audition after this one.",
  },
  {
    q: "Does this replace my vocal coach?",
    a: "No — it complements coaching. This course covers the audition-room skills a coach rarely gets time for: cutting music, sight-readability, tempo, the handover, and how the room actually works from the pianist's bench.",
  },
  {
    q: "What if it isn't for me?",
    a: `There's a ${GUARANTEE_DAYS}-day money-back guarantee. Start the course, and if it isn't exactly what you hoped, email ${SUPPORT_EMAIL} within ${GUARANTEE_DAYS} days for a full refund.`,
  },
];

export const metadata = {
  title: `${SITE_NAME}: A Video Course for Musical Theatre Singers`,
  description:
    "Choose your songs, cut and prepare your music, deliver tempo, and collaborate with the pianist and panel like a pro. One payment, lifetime access.",
  alternates: { canonical: `${APP_URL}/` },
  openGraph: {
    type: "website",
    url: `${APP_URL}/`,
    siteName: SITE_NAME,
    title: `${SITE_NAME}: A Video Course for Musical Theatre Singers`,
    description:
      "Choose your songs, cut and prepare your music, deliver tempo, and collaborate with the pianist and panel like a pro. One payment, lifetime access.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}: A Video Course for Musical Theatre Singers`,
    description:
      "Choose your songs, cut and prepare your music, deliver tempo, and collaborate with the pianist and panel like a pro. One payment, lifetime access.",
  },
};

export default async function Home() {
  const [stats, price] = await Promise.all([getPublicCourseStats(), getCoursePrice()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: SITE_NAME,
        description:
          "A video course for musical theatre performers: choose and cut your songs, set your tempo, and collaborate with the audition pianist and panel with confidence.",
        url: `${APP_URL}/`,
        provider: { "@type": "Organization", name: SITE_NAME, sameAs: APP_URL },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: "PT10H",
          inLanguage: "en-AU",
        },
        offers: {
          "@type": "Offer",
          price: String(price.amount),
          priceCurrency: price.currency,
          availability: "https://schema.org/InStock",
          url: primaryHref,
        },
      },
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: APP_URL,
        sameAs: [APP_URL],
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: `${APP_URL}/`,
        inLanguage: "en-AU",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <SessionRedirect />
      <MobileStickyCTA />
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-[-10%] w-[420px] h-[420px] rounded-full bg-accent/[0.05] blur-3xl pointer-events-none" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-transparent bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/10">
              <Music size={18} />
            </div>
            <span className="font-serif font-bold text-primary text-base sm:text-lg tracking-tight whitespace-nowrap">
              {SITE_NAME}
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 border border-border bg-card/60 hover:border-primary/25 text-foreground/80 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              Sign in
            </Link>
            <Link
              href={primaryHref}
              className="btn-sheen hidden sm:inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              {primaryLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center">
        <div className="text-center space-y-8 max-w-3xl mx-auto px-6 pt-12 sm:pt-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10 text-primary text-[11px] font-semibold uppercase tracking-[0.15em] shadow-sm shadow-primary/[0.03]">
              <Sparkles className="w-3 h-3" />
              For Musical Theatre Performers
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-primary tracking-tight leading-[1.08] [font-feature-settings:'liga'_0,'calt'_0] [letter-spacing:0.01em]">
              From first audition
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-periwinkle to-accent-bright">
                to final callback.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              A video course for musical theatre performers. Choose your songs, cut and prepare your music, deliver tempo, and collaborate with the pianist and panel like a pro.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 pt-2">
            <CTAButton href={primaryHref}>{primaryLabel}</CTAButton>
            <Link
              href={previewHref(FREE_PREVIEWS[0])}
              className="text-sm text-primary hover:underline underline-offset-4 inline-flex items-center gap-1.5"
            >
              Not sure yet? Watch a free lesson <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-xs text-muted-foreground/70">
              {price.display} · one-time payment ·{" "}
              <ShieldCheck className="inline w-3 h-3 -mt-0.5" /> {GUARANTEE_DAYS}-day money-back guarantee
            </p>
            <p className="text-xs text-muted-foreground/70">
              Already own the course?{" "}
              <Link href="/auth/sign-in" className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none rounded">Sign in</Link>
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
        <section className="w-full mt-16 sm:mt-20 bg-gradient-to-b from-periwinkle/35 via-periwinkle/25 to-transparent py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <Reveal>
              <div className="flex items-center gap-3 justify-center mb-12">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-bright/60" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright">What you&apos;ll master</span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-bright/60" />
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: Scissors, n: "01", title: "Cut & Prepare", desc: "Choose and cut your songs so any pianist can sight-read them on the spot." },
                { icon: Mic, n: "02", title: "Audition Ready", desc: "Walk into any room calm and prepared, with clear tempo, a smooth handover, and real presence." },
                { icon: Piano, n: "03", title: "Collaboration", desc: "Work with the pianist and panel as a true collaborator, from hello to last note." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 90}>
                  <div className="group relative h-full p-6 rounded-2xl bg-card border border-border/60 overflow-hidden hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.05] hover:-translate-y-1 transition-all duration-200">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center border border-primary/10 transition-colors group-hover:bg-primary/10">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-serif text-lg text-accent-bright font-semibold tabular-nums">{item.n}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-primary mb-1.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* What's inside — live published curriculum */}
        <CurriculumPreview />

        {/* The journey — navy band */}
        <section className="w-full bg-primary relative overflow-hidden py-20 sm:py-24">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-accent/[0.06] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-[-10%] w-96 h-96 rounded-full bg-accent/[0.05] blur-3xl pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-6">
            <Reveal>
              <div className="flex items-center gap-3 justify-center mb-4">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent/70" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">The journey</span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent/70" />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-center text-3xl sm:text-4xl font-serif font-bold text-primary-foreground mb-3">A structured path, built for the room</h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-center text-sm text-primary-foreground/70 max-w-xl mx-auto mb-12 leading-relaxed">
                Three levels, each one building the skills that read as professional the moment you walk into the audition room.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { n: "01", name: "Foundations", desc: "Choose the right songs and prepare your music so it's easy to read and hard to get wrong under pressure." },
                { n: "02", name: "Preparation", desc: "Cut and annotate with confidence, deliver your tempo, and hand your music over with a handover that lands." },
                { n: "03", name: "Collaboration", desc: "Work with full presence alongside the pianist and panel, and handle whatever the room throws at you." },
              ].map((item, i) => (
                <Reveal key={item.n} delay={i * 90}>
                  <div className="group h-full p-6 rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-3.5 h-3.5 text-accent/80" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent/80">Level {item.n}</span>
                    </div>
                    <h3 className="text-base font-serif font-semibold text-primary-foreground mb-1.5">{item.name}</h3>
                    <p className="text-xs text-primary-foreground/70 leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Is this for you — honest fit */}
        <section className="w-full py-20 sm:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <Reveal>
              <div className="flex items-center gap-3 justify-center mb-4">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-bright/60" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright">An honest fit</span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-bright/60" />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-center text-3xl sm:text-4xl font-serif font-bold text-primary mb-3">Is this for you?</h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
                This course is built around one specific transformation: walking into the audition room prepared, calm, and in control. Here&apos;s who it&apos;s for — and who it isn&apos;t.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6">
              <Reveal>
                <div className="relative h-full rounded-2xl border border-primary/15 bg-primary/[0.03] p-6 sm:p-7 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/70 mb-5">This is for you if…</p>
                  <ul className="space-y-3.5">
                    {[
                      "An audition is coming up and you want your songs and cuts ready before the door opens.",
                      "Callbacks keep stopping you — you want to walk in able to read the room and stay in control.",
                      "You want your music handed over so any pianist can sight-read it cold.",
                      "You want to feel calm and prepared, not fast and nervous.",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-3 text-sm text-foreground/80 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-accent-bright shrink-0 mt-0.5" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="relative h-full rounded-2xl border border-border/60 bg-muted/30 p-6 sm:p-7 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 mb-5">Honestly, not if…</p>
                  <ul className="space-y-3.5">
                    {[
                      "You're looking for hands-on vocal technique coaching — that's a coach's room, not this bench.",
                      "You want live, in-person rehearsals with a pianist — this course is self-paced video.",
                      "You're not ready to put in the preparation work — the whole course is built on it.",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-3 text-sm text-foreground/60 leading-relaxed">
                        <X className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Meet your instructor */}
        <section className="w-full py-20 sm:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <Reveal>
              <div className="flex items-center gap-3 justify-center mb-4">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-bright/60" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright">Meet your instructor</span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-bright/60" />
              </div>
            </Reveal>

            <div className="grid md:grid-cols-[300px_1fr] gap-10 items-start mt-10">
              {/* Headshot */}
              <Reveal className="mx-auto w-full max-w-[300px]">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/10 via-accent/10 to-accent-bright/10 blur-xl pointer-events-none" />
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden ring-1 ring-black/10 shadow-xl shadow-primary/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#356DA8]" />
                    <div className="absolute inset-0 sheet-music-texture opacity-10" />
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
                    <Image
                      src="/headshot.jpeg"
                      alt="Daniele Buatti"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/40 to-transparent" />
                  </div>
                </div>
                <div className="text-center mt-5">
                  <p className="text-sm font-serif font-bold text-primary">Daniele Buatti</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pianist · Vocal Coach · Music Director</p>
                </div>
              </Reveal>

              {/* Bio */}
              <Reveal delay={100}>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary leading-tight">
                  Your auditions, from the accompanist&apos;s bench
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed">
                  I&apos;m Daniele Buatti, a pianist, music director, vocal coach, and embodiment practitioner from Melbourne. I&apos;ve spent fifteen years at the piano in audition rooms: reading cuts, setting tempos, and watching hundreds of performers walk in and out. This course is built so you walk in feeling prepared, calm, and entirely in control.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "15+ years across musical theatre as an audition pianist, music director, and vocal coach.",
                    "Vocal coach: helping singers find technique, interpretation, and presence for auditions and shows.",
                    "Embodiment practitioner: trained in kinesiology, helping performers stay calm, present, and grounded under pressure.",
                    "Educator at heart: making the practical side of performing clear, simple, and doable.",
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
              </Reveal>
            </div>
          </div>
        </section>

        {/* Guarantee — risk reversal */}
        <section className="w-full bg-primary relative overflow-hidden py-20 sm:py-24">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-accent/[0.06] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-[-8%] w-80 h-80 rounded-full bg-accent/[0.05] blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <Reveal>
              <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-6 ring-1 ring-accent/25">
                <ShieldCheck className="w-7 h-7 text-accent" />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-foreground mb-4">
                A {GUARANTEE_DAYS}-day money-back guarantee
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-sm sm:text-base text-primary-foreground/75 max-w-xl mx-auto leading-relaxed">
                Start the course and put it to work on your next audition. If it isn&apos;t exactly what you hoped — if your music doesn&apos;t feel prepared and you don&apos;t walk in more in control — email within {GUARANTEE_DAYS} days for a full refund. No questions, no forms, no hard feelings.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-xs text-primary-foreground/60 mt-6 max-w-md mx-auto leading-relaxed">
                The only thing you can lose is a few days. Everything you can gain is every audition you&apos;ll walk into from now on.
              </p>
            </Reveal>
          </div>
        </section>

        {/* FAQ — objections */}
        <section id="faq" className="w-full py-20 sm:py-24">
          <div className="max-w-3xl mx-auto px-6">
            <Reveal>
              <div className="flex items-center gap-3 justify-center mb-4">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-bright/60" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright">Questions, answered</span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-bright/60" />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-center text-3xl sm:text-4xl font-serif font-bold text-primary mb-10">Everything you&apos;re wondering</h2>
            </Reveal>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="group rounded-2xl border border-border/60 bg-card/50 open:border-primary/20 open:bg-card/70 transition-colors">
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none rounded-2xl">
                    {faq.q}
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Email capture — own your audience */}
        <section className="w-full bg-gradient-to-b from-periwinkle/35 via-periwinkle/25 to-transparent py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Reveal>
              <div className="flex items-center gap-3 justify-center mb-4">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-accent-bright/60" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright">Free email series</span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-accent-bright/60" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-3">Leave the last-minute panic behind</h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
                One short, practical audition-preparation tip in your inbox each week — the pre-audition checklists, the handover scripts, the tempo conversations nobody teaches. No spam, unsubscribe anytime.
              </p>
              <WaitlistForm />
              <p className="text-[11px] text-muted-foreground/70 mt-4">
                You&apos;re not buying anything — just joining the list. See our{" "}
                <Link href="/privacy" className="text-primary hover:underline">privacy policy</Link>.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Trust strip */}
        <section className="w-full border-y border-border/40 bg-gradient-to-b from-card/60 to-card/30 py-12">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 text-center">
              {[
                { n: String(stats.levelCount), label: "Structured levels" },
                { n: String(stats.moduleCount), label: "Modules" },
                { n: String(stats.lessonCount), label: "Lessons" },
                { n: "15+", label: "Years in the room" },
              ].map((stat, i) => (
                <Reveal key={stat.label} delay={i * 70}>
                  <div className="group">
                    <p className="font-serif text-2xl sm:text-3xl font-bold text-primary tabular-nums group-hover:text-primary/80 transition-colors">{stat.n}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <div className="w-full max-w-4xl mx-auto px-6 pb-24">
          <Reveal>
            <div className="relative rounded-3xl border border-accent/20 bg-gradient-to-b from-accent/[0.08] to-accent/[0.03] px-8 py-12 sm:py-14 text-center overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/[0.08] blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-accent-bright/[0.06] blur-3xl pointer-events-none" />
              <div className="relative">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright mb-3 block">Ready when you are</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-3">Get full access to the complete course</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Every module, lesson, and resource, yours for life, at your own pace.
                </p>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-primary tabular-nums tracking-tight">
                    {price.display}
                  </span>
                  <span className="text-left text-[11px] leading-tight text-muted-foreground">
                    <span className="block font-semibold text-foreground/70">One-time payment</span>
                    <span>Full lifetime access</span>
                  </span>
                </div>

                <CTAButton href={primaryHref}>{primaryLabel}</CTAButton>
                <p className="text-xs text-foreground/70 mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-bright" />
                  {GUARANTEE_DAYS}-day money-back guarantee
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-2 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Secure checkout via Stripe · instant access
                </p>
                <div className="mt-8">
                  <PromoCountdown />
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Footer */}
        <footer className="w-full border-t border-border/40 bg-card/40 pb-10 pt-12">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid sm:grid-cols-[1fr_auto_auto] gap-8 sm:gap-12 items-start mb-10">
              <div>
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/10">
                    <Music size={18} />
                  </div>
                  <span className="font-serif font-bold text-primary text-lg tracking-tight">
                    {SITE_NAME}
                  </span>
                </Link>
                <p className="text-xs text-muted-foreground/70 mt-3 max-w-xs leading-relaxed">
                  A video course for musical theatre performers, taught from the accompanist&apos;s bench.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">Course</p>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/#curriculum" className="text-foreground/70 hover:text-primary transition-colors">Browse the curriculum</Link></li>
                  <li><Link href="/guides" className="text-foreground/70 hover:text-primary transition-colors">Free audition guides</Link></li>
                  <li><Link href="/auth/sign-in" className="text-foreground/70 hover:text-primary transition-colors">Sign in to your course</Link></li>
                  <li><Link href={primaryHref} className="text-foreground/70 hover:text-primary transition-colors">{primaryLabel}</Link></li>
                </ul>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">Support</p>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/#faq" className="text-foreground/70 hover:text-primary transition-colors">Frequently asked questions</Link></li>
                  <li><a href={`mailto:${SUPPORT_EMAIL}`} className="text-foreground/70 hover:text-primary transition-colors">Contact &amp; refunds</a></li>
                  <li><Link href="/privacy" className="text-foreground/70 hover:text-primary transition-colors">Privacy policy</Link></li>
                  <li><Link href="/terms" className="text-foreground/70 hover:text-primary transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 pt-6">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-primary/40" />
                <span className="text-[11px] text-muted-foreground/60">{SITE_NAME}</span>
              </div>
              <p className="text-[11px] text-muted-foreground/70 tracking-wide">
                {COPYRIGHT_LINE}
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}