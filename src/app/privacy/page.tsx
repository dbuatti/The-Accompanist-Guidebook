import Link from "next/link";
import { Music, ArrowLeft } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your data.`,
  robots: { index: true, follow: true },
};

const sections = [
  {
    h: "What we collect",
    p: [
      "When you join our email list, we collect your email address. When you create an account, we collect your name and email address. When you purchase the course, we receive confirmation of the transaction from our payment provider (Stripe).",
      "We do not collect or store your card details. Payments are processed entirely by Stripe and are subject to Stripe's own privacy policy.",
    ],
  },
  {
    h: "How we use it",
    p: [
      "Your data is used to give you access to the course you purchased, to keep you signed in, to send the email tips you subscribed to, and to understand how the course is used so we can improve it.",
      "We never sell your data. We only share it with the providers required to make the product work: our database host (Neon), our payment provider (Stripe), and our email service (Kit, formerly ConvertKit), which stores the email addresses of people who join our list and sends the emails they've opted into.",
    ],
  },
  {
    h: "Email communications",
    p: [
      "You will only receive marketing emails if you joined the list or opted in. Emails are sent through Kit (formerly ConvertKit), our email service provider. Every email we send includes a one-click unsubscribe link managed by Kit, and you can request removal at any time by contacting us.",
    ],
  },
  {
    h: "Your rights",
    p: [
      "You can ask us for a copy of the data we hold about you, correct it, or ask us to delete it. Contact us at support@theauditionguidebook.com and we will respond within 30 days.",
    ],
  },
  {
    h: "Cookies and sessions",
    p: [
      "We use secure session tokens to keep you logged in. We do not use third-party advertising cookies on this site.",
    ],
  },
  {
    h: "Changes to this policy",
    p: [
      "If we change how we handle your data, we will update this page. Continued use of the site after an update means you accept the revised policy.",
    ],
  },
];

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-serif font-bold text-primary mb-3">Privacy Policy</h1>
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

        <div className="mt-10 rounded-2xl border border-border/60 bg-card/50 p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Questions? Contact{" "}
            <a href="mailto:support@theauditionguidebook.com" className="text-primary hover:underline">
              support@theauditionguidebook.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}