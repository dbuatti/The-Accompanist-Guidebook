import Link from "next/link";
import { Music, ArrowRight, Scissors, ListChecks, Hand, Library, Sheet } from "lucide-react";
import WaitlistForm from "@/components/WaitlistForm";
import { SITE_NAME, primaryHref, primaryLabel } from "@/lib/constants";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";

export const metadata = {
  title: "Free Audition Preparation Guides",
  description:
    "Free, practical audition guides for musical theatre performers: how many songs to prepare, how to cut sheet music, the handover protocol, what to bring, and a printable 48-hour checklist.",
  alternates: { canonical: `${BASE}/guides` },
  openGraph: {
    type: "website",
    url: `${BASE}/guides`,
    title: "Free Audition Preparation Guides",
    description: "Practical, free guides for musical theatre auditions — from the accompanist's bench.",
  },
};

const guides = [
  {
    href: "/guides/how-many-songs-for-a-musical-theatre-audition",
    icon: Library,
    title: "How many songs should you prepare?",
    desc: "Six songs you own beat twenty you're shaky on. Building an audition book that works.",
  },
  {
    href: "/guides/how-to-cut-sheet-music-for-an-audition",
    icon: Scissors,
    title: "How to cut sheet music",
    desc: "Cuts are measured in seconds, not bars. Make a cut any pianist can sight-read cold.",
  },
  {
    href: "/guides/how-to-hand-over-your-music-to-the-audition-pianist",
    icon: Hand,
    title: "The music handover, done right",
    desc: "Scan first, tempo last — the exact protocol from someone on the bench every day.",
  },
  {
    href: "/guides/what-to-bring-to-a-musical-theatre-audition",
    icon: Sheet,
    title: "What to bring to an audition",
    desc: "The kit that makes you read as professional before you've sung a note.",
  },
  {
    href: "/guides/the-48-hour-pre-audition-checklist",
    icon: ListChecks,
    title: "The 48-hour pre-audition checklist",
    desc: "Printable checklist for the two days before — tick it, walk in calm.",
  },
];

export default function GuidesHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free Audition Preparation Guides",
    url: `${BASE}/guides`,
    author: { "@type": "Person", name: "Daniele Buatti" },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      <div className="absolute -top-24 right-[-10%] w-[420px] h-[420px] rounded-full bg-accent/[0.05] blur-3xl pointer-events-none" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-30 border-b border-border/30 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/10">
              <Music size={18} />
            </div>
            <span className="font-serif font-bold text-primary text-lg tracking-tight">{SITE_NAME}</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15"
            >
              {primaryLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <div className="max-w-3xl mx-auto px-6 pt-12 sm:pt-20 pb-20">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright mb-3">
              Free resources
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight leading-[1.1]">
              Audition preparation guides
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
              Practical, free, and written from the accompanist&apos;s bench. Grab what you need before your next room.
            </p>
          </div>

          <div className="grid gap-4">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group flex items-start gap-5 rounded-2xl border border-border/60 bg-card/50 hover:border-primary/20 hover:shadow-md hover:shadow-primary/[0.04] hover:-translate-y-0.5 transition-all duration-200 p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/8 border border-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <guide.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-serif font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    {guide.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{guide.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary shrink-0 self-center transition-all group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-accent/25 bg-gradient-to-b from-accent/[0.08] to-accent/[0.03] p-7 sm:p-8 text-center">
            <h2 className="text-xl font-serif font-bold text-primary mb-2">Want the full room, step by step?</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
              The complete course turns these guides into a rehearsed system — repertoire, cuts, tempo, handover, and owning the room.
            </p>
            <a
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
            >
              {primaryLabel}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-8 rounded-3xl border border-border/60 bg-card/50 p-7 sm:p-8 text-center">
            <h3 className="text-lg font-serif font-bold text-primary mb-2">One tip a week, in your inbox</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Short, practical audition-prep tips. No spam, unsubscribe anytime.
            </p>
            <WaitlistForm source="guides-hub" />
          </div>
        </div>
      </main>

      <footer className="w-full pb-10 pt-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Music className="w-4 h-4 text-primary/40" />
            <span className="text-[11px] text-muted-foreground/60">{SITE_NAME}</span>
          </Link>
          <nav className="flex items-center gap-5 text-[11px] text-muted-foreground/70">
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