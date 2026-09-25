import Link from "next/link";
import { Music, ArrowLeft, ShieldCheck } from "lucide-react";
import { SITE_NAME, GUARANTEE_DAYS, SUPPORT_EMAIL, OWNER_NAME } from "@/lib/constants";
import { getCoursePrice } from "@/lib/pricing";

export const metadata = {
  title: "Terms of Service",
  description: `The terms that apply to buying and using ${SITE_NAME}.`,
  robots: { index: true, follow: true },
};

export const revalidate = 300;

function buildSections(priceDisplay: string) {
  return [
    {
      h: "Who we are",
      p: [
        `${SITE_NAME} is created and sold by ${OWNER_NAME}, a sole trader based in Melbourne, Victoria, Australia. For anything to do with your purchase, email ${SUPPORT_EMAIL}.`,
      ],
    },
    {
      h: "What you're buying",
      p: [
        `${SITE_NAME} is a digital video course for musical theatre performers. A one-time payment of ${priceDisplay} grants you lifetime access to the course content then available, plus any future lessons and resources we add.`,
      "The licence is for you, personally. You may not resell, share, or redistribute the course content or your account access to anyone else.",
    ],
  },
  {
    h: `Our ${GUARANTEE_DAYS}-day money-back guarantee`,
    p: [
      `If the course isn't exactly what you hoped, email ${SUPPORT_EMAIL} within ${GUARANTEE_DAYS} days of purchase and we will refund your payment in full. No questions and no hard feelings.`,
      "Refunds are issued to the original payment method and usually appear within 5–10 business days. Course access ends when a refund is processed.",
    ],
  },
  {
    h: "What the course is (and isn't)",
    p: [
      "The course teaches audition preparation: repertoire selection and cuts, music preparation, tempo, the handover, and collaboration with the accompanist and panel. It is educational content, not vocal-technique coaching or medical advice.",
      "We don't promise, and can't guarantee, that you will book a role. Auditions are subjective and no course can promise outcomes. What we can promise is that you'll walk in prepared, calm, and in control.",
    ],
  },
  {
    h: "Access and accounts",
    p: [
      "The course is delivered through a secure account. You're responsible for keeping your login details safe. If you think your account has been compromised, contact us and we'll help.",
      "Course content or pricing may evolve as we add lessons — your existing access is never reduced.",
    ],
  },
  {
    h: "Liability",
    p: [
      "Nothing in these terms excludes, restricts or modifies any right or remedy you have under the Australian Consumer Law, including the consumer guarantees, that cannot lawfully be excluded.",
      `Subject to that, and to the maximum extent permitted by law, our total liability to you is limited to the amount you paid for the course.`,
    ],
  },
  {
    h: "Governing law",
    p: [
      "These terms are governed by the laws of Victoria, Australia. Any disputes will be handled in that jurisdiction.",
    ],
  },
  ];
}

export default async function Terms() {
  const price = await getCoursePrice();
  const sections = buildSections(price.display);

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/10">
            <Music size={18} />
          </div>
          <span className="font-serif font-bold text-primary text-lg tracking-tight">{SITE_NAME}</span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright mb-3">Legal</p>
        <h1 className="text-4xl font-serif font-bold text-primary mb-3">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: September 2026</p>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-serif font-bold text-primary mb-2">{s.h}</h2>
              {s.p.map((para) => (
                <p key={para} className="text-sm text-foreground/70 leading-relaxed mb-3">{para}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-accent/30 bg-accent/[0.06] p-5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-accent-bright shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/70 leading-relaxed">
            Not sure yet? The {GUARANTEE_DAYS}-day money-back guarantee means you can try the course completely risk-free.
          </p>
        </div>
      </main>
    </div>
  );
}