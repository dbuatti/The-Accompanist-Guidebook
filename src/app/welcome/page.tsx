"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Lock,
  ArrowRight,
  Music,
  LogOut,
  CheckCircle2,
  BookOpen,
  Feather,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { showSuccess, showError } from "@/utils/toast";
import { MarkdownBody } from "@/components/MarkdownBody";
import {
  getWelcomeContent,
  getCourseContent,
  getProgress,
  getPaidStatus,
  markAsPaid,
  ensureUserExists,
} from "@/app/actions";
import { ADMIN_EMAILS } from "@/lib/admin";

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [welcome, setWelcome] = useState<{ title: string; content: string } | null>(null);
  const [content, setContent] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
  const isAdmin = !!(session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase()));

  useEffect(() => {
    if (session?.user) {
      ensureUserExists();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [welcomeData, progress, paid, courseData] = await Promise.all([
        getWelcomeContent(),
        session?.user?.id ? getProgress() : Promise.resolve([] as any[]),
        session?.user?.id ? getPaidStatus() : Promise.resolve({ isPaid: false }),
        getCourseContent(),
      ]);
      setWelcome(welcomeData);
      setProgressData(progress);
      setIsPaid(paid.isPaid);
      setContent(courseData);
    } catch {
      showError("Failed to load your welcome page");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPending) return;
    const params = new URLSearchParams(window.location.search);
    const hasPaidParam = params.get("paid") === "1";
    const hasPendingCookie = document.cookie.split(";").some((c) => c.trim().startsWith("pending_paid=1"));
    if (!hasPaidParam && !hasPendingCookie) return;

    if (!session?.user) {
      document.cookie = "pending_paid=1; path=/; max-age=3600";
      router.push("/auth/sign-in");
      return;
    }

    const applyPurchase = async () => {
      try {
        await markAsPaid();
        document.cookie = "pending_paid=1; path=/; max-age=0";
        params.delete("paid");
        window.history.replaceState({}, "", window.location.pathname + params.toString());
        setIsPaid(true);
        showSuccess("Course unlocked — welcome aboard!");
        fetchData();
      } catch {
        showError("Couldn't confirm your purchase yet — please try again.");
      }
    };
    applyPurchase();
  }, [session, isPending]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  const handleLogout = async () => { await authClient.signOut(); router.push("/"); };

  if (isLoading || (isPending && !session)) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin && !isPaid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
        <div className="relative max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">Full course access</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The complete curriculum unlocks with full course access — every module, lesson, and resource, yours to work through at your own pace.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 pt-2">
            {paymentLink ? (
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Full Access
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <Link href="/auth/sign-in" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5">
                Sign in to view your course
              </Link>
            )}
            <p className="text-xs text-muted-foreground/70">
              Already own it?{" "}
              <Link href="/auth/sign-in" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = content.reduce((sum: number, l: any) => sum + (l.modules?.reduce((s: number, m: any) => s + (m.lessons?.length || 0), 0) || 0), 0);
  const completedLessons = progressData.filter((p) => p.completedAt).length;
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />

      {/* Nav */}
      <header className="relative z-20">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/modules" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/10">
              <Music size={18} />
            </div>
            <span className="font-serif font-bold text-primary text-lg tracking-tight">
              The Audition Guidebook
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/modules" className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary text-sm font-medium transition-colors">
              Course
            </Link>
            {session ? (
              <button onClick={handleLogout} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors" aria-label="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link href="/auth/sign-in" className="inline-flex items-center gap-2 border border-border bg-card/60 hover:border-primary/25 text-foreground/80 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <div className="max-w-3xl mx-auto px-6 pt-12 sm:pt-16 pb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10 text-primary text-[11px] font-semibold uppercase tracking-[0.15em]">
            <Feather className="w-3 h-3" />
            Before you begin
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-primary tracking-tight leading-[1.1] mt-5">
            {welcome?.title || "A letter from Daniele"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mt-4 leading-relaxed">
            Hi, I&apos;m Daniele — a pianist, music director, vocal coach, and educator. Take a minute to read this before your first lesson.
          </p>
        </div>

        {/* Letter */}
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="relative rounded-3xl border border-border/40 bg-card/70 shadow-sm shadow-primary/[0.03] px-6 sm:px-10 py-10 sm:py-12">
            <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-accent/[0.07] blur-3xl pointer-events-none" />
            {welcome?.content ? (
              <MarkdownBody markdown={welcome.content} />
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">A note from Daniele is on its way.</p>
            )}
            <div className="mt-12 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/15 shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-serif font-bold text-primary">Daniele Buatti</p>
                <p className="text-xs text-muted-foreground">Pianist · Vocal Coach · Music Director</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next step */}
        <div className="max-w-3xl mx-auto px-6 pb-20">
          <div className="rounded-3xl border border-accent/25 bg-accent/[0.07] px-8 py-10 text-center">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary">Ready to begin?</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
              Head into the course and start with Module 1. You can go at your own pace and pick up exactly where you left off.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <Link
                href="/modules"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                <BookOpen className="w-4 h-4" />
                Start the course
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/modules"
                className="inline-flex items-center gap-2 border border-border bg-card/60 hover:border-primary/25 text-foreground/80 px-8 py-3.5 rounded-xl font-medium text-sm transition-all"
              >
                Browse the modules
              </Link>
            </div>

            {totalLessons > 0 && (
              <div className="mt-8 flex items-center gap-3 max-w-xs mx-auto">
                <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  {completedLessons}/{totalLessons} lessons · {pct}%
                </span>
              </div>
            )}

            <p className="text-xs text-muted-foreground/60 mt-5 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save your progress as you go — it syncs automatically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
