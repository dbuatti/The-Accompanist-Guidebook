import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, ArrowRight, ExternalLink, Music, PlayCircle, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { lessons, modules, resources } from "@/lib/schema";
import {
  SITE_NAME,
  COPYRIGHT_LINE,
  FREE_PREVIEWS,
  GUARANTEE_DAYS,
  isFreePreview,
  previewHref,
  primaryHref,
} from "@/lib/constants";
import { getCoursePrice } from "@/lib/pricing";
import { MarkdownBody } from "@/components/MarkdownBody";
import PreviewVideo from "@/components/PreviewVideo";

export const revalidate = 300;

type Params = { moduleSlug: string; lessonSlug: string };

async function loadPreview({ moduleSlug, lessonSlug }: Params) {
  // Only whitelisted lessons are ever served here — this route is public.
  if (!isFreePreview(moduleSlug, lessonSlug)) return null;
  const [mod] = await db.select().from(modules).where(eq(modules.slug, moduleSlug));
  if (!mod) return null;
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.moduleId, mod.id), eq(lessons.slug, lessonSlug), eq(lessons.isPublished, true)));
  if (!lesson) return null;
  const res = await db.select().from(resources).where(eq(resources.lessonId, lesson.id)).orderBy(asc(resources.displayOrder));
  return { mod, lesson, res };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await loadPreview(params).catch(() => null);
  if (!data) return { title: "Free lesson" };
  return {
    title: `${data.lesson.title} (free lesson)`,
    description: `A free lesson from ${SITE_NAME}: ${data.lesson.title}. Watch it now, no sign-up needed.`,
  };
}

export default async function PreviewPage({ params }: { params: Params }) {
  const data = await loadPreview(params);
  if (!data) notFound();
  const { mod, lesson, res } = data;
  const price = await getCoursePrice();
  const others = FREE_PREVIEWS.filter((p) => !(p.moduleSlug === params.moduleSlug && p.lessonSlug === params.lessonSlug));
  const buyExternal = primaryHref.startsWith("http");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/10">
              <Music size={18} />
            </div>
            <span className="font-serif font-bold text-primary text-base sm:text-lg tracking-tight whitespace-nowrap">{SITE_NAME}</span>
          </Link>
          <a
            href={primaryHref}
            target={buyExternal ? "_blank" : undefined}
            rel={buyExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap hover:bg-primary/90 transition-all"
          >
            <span className="sm:hidden">Get access</span>
            <span className="hidden sm:inline">Get the full course</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
        <Link href="/#curriculum" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-3 h-3" /> See the full curriculum
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-4">
          <PlayCircle className="w-3.5 h-3.5" /> Free lesson
        </div>
        <p className="text-xs text-muted-foreground mb-2">From: {mod.title.replace(/^Module \d+:\s*/, "")}</p>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-primary leading-tight mb-8">{lesson.title}</h1>

        {lesson.videoUrl && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg shadow-black/5 ring-1 ring-black/5">
            <PreviewVideo url={lesson.videoUrl} />
          </div>
        )}

        <MarkdownBody markdown={lesson.notes || ""} />

        {res.length > 0 && (
          <div className="mt-10 grid gap-3">
            {res.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-card/40 border border-border/30 rounded-2xl hover:border-primary/20"
              >
                <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-primary">{r.title}</span>
              </a>
            ))}
          </div>
        )}

        <section className="mt-14 rounded-3xl border border-accent/25 bg-gradient-to-b from-card to-card/40 p-7 sm:p-9 text-center">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary mb-2">Liked this lesson?</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
            The full course takes you from choosing your songs to walking out of the audition room, with every lesson
            taught from the accompanist&apos;s bench.
          </p>
          <a
            href={primaryHref}
            target={buyExternal ? "_blank" : undefined}
            rel={buyExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            Get full access · {price.display}
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-xs text-foreground/60 mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-bright" /> {GUARANTEE_DAYS}-day money-back guarantee · one-time payment
          </p>
          {others.length > 0 && (
            <p className="text-xs text-muted-foreground mt-6">
              Want another taste first?{" "}
              <Link href={previewHref(others[0])} className="text-primary hover:underline">
                Watch the other free lesson
              </Link>
            </p>
          )}
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 mt-10">
        <p className="text-center text-[11px] text-muted-foreground/70">{COPYRIGHT_LINE}</p>
      </footer>
    </div>
  );
}
