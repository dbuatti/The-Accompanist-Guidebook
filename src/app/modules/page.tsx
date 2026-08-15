"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCourseContent, getProgress, toggleLessonProgress, publishAllLessons, ensureUserExists, getPaidStatus, markAsPaid } from "@/app/actions";
import { formatModuleTitle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ChevronRight,
  ChevronDown,
  Layers,
  FolderOpen,
  BookOpen,
  Lightbulb,
  Link2,
  ExternalLink,
  CheckCircle2,
  LogOut,
  Menu,
  Eye,
  EyeOff,
  Music,
  FileText,
  Lock,
  ArrowRight,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { showSuccess, showError } from "@/utils/toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";

import { ADMIN_EMAILS } from "@/lib/admin";

export default function ModulesPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialModuleSet = useRef(false);

  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedModuleId]);

  useEffect(() => {
    if (selectedModuleId) {
      const url = new URL(window.location.href);
      url.searchParams.set("module", selectedModuleId);
      window.history.replaceState({}, "", url.toString());
    }
  }, [selectedModuleId]);

  const isAdmin = !!(session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase()));

  useEffect(() => {
    if (session?.user) {
      ensureUserExists();
    }
  }, [session]);

  useEffect(() => { fetchData(); }, [session?.user?.id]);

  useEffect(() => {
    if (!initialModuleSet.current && !isPending) {
      const params = new URLSearchParams(window.location.search);
      const moduleId = params.get("module");
      if (moduleId) {
        setSelectedModuleId(moduleId);
      }
      initialModuleSet.current = true;
    }
  }, [isPending]);

  // Handle return from Stripe: ?paid=1 (or a pending_paid cookie set for
  // anonymous buyers who had to sign in before the flag could be applied).
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

  const fetchData = async () => {
    try {
      if (session?.user?.id) {
        const [progress, paid] = await Promise.all([getProgress(), getPaidStatus()]);
        setProgressData(progress);
        setIsPaid(paid.isPaid);
      }
      const data = await getCourseContent();
      setContent(data);
      if (data.length > 0) {
        const allExpanded: Record<string, boolean> = {};
        for (const level of data) {
          allExpanded[level.id] = true;
        }
        setExpandedLevels(allExpanded);
      }
    } catch (error) {
      showError("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  const isLessonCompleted = (id: string) => progressData.some((p) => p.lessonId === id && p.completedAt);

  const handleToggleComplete = async (lessonId: string) => {
    if (!session?.user?.id) return;
    try {
      await toggleLessonProgress(lessonId);
      setProgressData(await getProgress());
      showSuccess("Progress updated!");
    } catch { showError("Failed to update progress"); }
  };

  const handlePublishAll = async () => {
    if (!confirm("Publish ALL lessons so they're visible to everyone?")) return;
    try { await publishAllLessons(); showSuccess("All lessons published!"); fetchData(); }
    catch { showError("Failed to publish"); }
  };

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

  const currentModule = findModule(content, selectedModuleId);

  const nav = (
    <div className="space-y-6">
      {/* All Modules */}
      <button
        onClick={() => setSelectedModuleId(null)}
        className={`flex items-start gap-3 w-full text-left px-3 py-3 rounded-xl transition-all ${
          !selectedModuleId
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "hover:bg-accent/20 text-foreground/70 border border-transparent hover:border-border/40"
        }`}
      >
        <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${!selectedModuleId ? "text-primary-foreground/80" : "text-muted-foreground/50"}`} />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium leading-snug block">All Modules</span>
        </div>
      </button>

      {content.map((level) => (
        <div key={level.id}>
          <button
            onClick={() => setExpandedLevels((p) => ({ ...p, [level.id]: !p[level.id] }))}
            className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/30 transition-colors"
          >
            {expandedLevels[level.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{level.title}</span>
          </button>
          {expandedLevels[level.id] && (
            <div className="mt-2 space-y-1">
                  {level.modules.map((mod: any) => {
                const isActive = selectedModuleId === mod.id;
                const isHidden = mod.isPublished === false;
                const done = mod.lessons.filter((l: any) => isLessonCompleted(l.id)).length;
                const total = mod.lessons.length;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`flex items-start gap-3 w-full text-left px-3 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "hover:bg-accent/20 text-foreground/70 border border-transparent hover:border-border/40"
                    }`}
                  >
                    <FolderOpen className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? "text-primary-foreground/80" : isHidden ? "text-muted-foreground/30" : "text-primary/60"}`} />
                    <div className="min-w-0 flex-1">
                      <span className={`text-sm font-medium leading-snug block ${isActive ? "" : isHidden ? "text-muted-foreground/50 italic" : ""}`}>
                        {formatModuleTitle(mod)}
                        {isHidden && (
                          <span className="ml-2 text-[10px] font-normal not-italic text-muted-foreground/40 uppercase tracking-wider">Coming soon</span>
                        )}
                      </span>
                      {!isActive && !isHidden && total > 0 && (
                        <span className="text-[10px] text-muted-foreground mt-1 block">{done}/{total} complete</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 border-r border-border/30 flex-col shrink-0 bg-gradient-to-b from-card/40 to-card/10">
        <div className="p-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-serif font-bold text-primary leading-tight">The Audition Guidebook</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Course modules &amp; resources</p>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">{nav}</ScrollArea>
        {session && (
          <div className="px-6 py-3 border-t border-border/30 bg-card/30">
            {(() => {
              const totalLessons = content.reduce((sum: number, l: any) => sum + (l.modules?.reduce((s: number, m: any) => s + (m.lessons?.length || 0), 0) || 0), 0);
              const completedLessons = content.reduce((sum: number, l: any) => sum + (l.modules?.reduce((s: number, m: any) => s + (m.lessons?.filter((les: any) => isLessonCompleted(les.id)).length || 0), 0) || 0), 0);
              const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">Course progress</span>
                    <span className="text-[11px] font-bold text-primary">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{completedLessons} of {totalLessons} lessons completed</p>
                </div>
              );
            })()}
          </div>
        )}
        <div className="p-4 border-t border-border/30">
          {session ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate max-w-[160px]">{session.user?.name || session.user?.email}</span>
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={handlePublishAll} className="h-7 text-[11px] text-primary hover:text-primary/80 px-2">
                    <Eye className="w-3 h-3 mr-1" /> Publish
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="h-7 text-[11px] text-muted-foreground px-2">
                  <LogOut className="w-3 h-3 mr-1" /> Exit
                </Button>
              </div>
            </div>
          ) : (
            <Link href="/auth/sign-in" className="text-[11px] text-primary hover:underline">Sign in to track your progress</Link>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden h-14 border-b border-border/30 flex items-center justify-between px-4 shrink-0">
          <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open navigation menu"><Menu className="w-5 h-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="p-6 border-b border-border/30">
                <h1 className="text-base font-serif font-bold text-primary">The Audition Guidebook</h1>
              </div>
              <div className="p-4">{nav}</div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-serif font-semibold text-primary truncate max-w-[180px]">{currentModule?.title || "All Modules"}</span>
          {session ? (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground" aria-label="Log out"><LogOut className="w-4 h-4" /></Button>
          ) : (
            <Link href="/auth/sign-in" className="text-[11px] text-primary hover:underline">Sign in</Link>
          )}
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {!selectedModuleId ? (
            <CurriculumView content={content} onSelectModule={setSelectedModuleId} />
          ) : !currentModule ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12">
              <BookOpen className="w-20 h-20 mb-6 opacity-15" />
              <p className="text-xl font-serif">Select a module to begin</p>
              <p className="text-sm mt-2 text-muted-foreground/60">Choose from the sidebar to explore your course.</p>
            </div>
          ) : !currentModule.isPublished ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
                <EyeOff className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-foreground/60 mb-2">{currentModule.title}</h2>
              <p className="text-sm text-muted-foreground/50 max-w-md text-center">This module is coming soon. Check back later for lessons and resources.</p>
            </div>
          ) : (
            <ModuleContent
              module={currentModule}
              isLessonCompleted={isLessonCompleted}
              onToggleComplete={handleToggleComplete}
              isLoggedIn={!!session}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function ModuleContent({ module, isLessonCompleted, onToggleComplete, isLoggedIn }: {
  module: any;
  isLessonCompleted: (id: string) => boolean;
  onToggleComplete: (id: string) => void;
  isLoggedIn: boolean;
}) {
  const lessons = module.lessons || [];

  return (
    <div>
      {/* Hero header */}
      <div className="relative border-b border-border/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-primary/[0.02] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-10 pt-10 sm:pt-14 pb-8 sm:pb-10">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="h-5 sm:h-6 px-2.5 sm:px-3 rounded-full bg-primary/10 flex items-center gap-1.5">
              <Layers className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-primary" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-primary">Module</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-primary leading-tight">{formatModuleTitle(module)}</h1>

          {/* Module progress */}
          {isLoggedIn && lessons.length > 0 && (() => {
            const done = lessons.filter((l: any) => isLessonCompleted(l.id)).length;
            const pct = Math.round((done / lessons.length) * 100);
            return (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">{done}/{lessons.length}</span>
              </div>
            );
          })()}

          {/* Jump-to pills */}
          {lessons.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {lessons.map((lesson: any, i: number) => (
                <button
                  key={lesson.id}
                  onClick={() => document.getElementById(`lesson-${lesson.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    isLessonCompleted(lesson.id)
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                  {lesson.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lessons */}
      <div className="max-w-4xl mx-auto px-5 sm:px-10 py-10 sm:py-12">
        <div className="space-y-10 sm:space-y-12">
          {lessons.map((lesson: any, i: number) => (
            <article key={lesson.id} id={`lesson-${lesson.id}`}>
              {/* Lesson header */}
              <div className="flex items-start gap-4 sm:gap-5 mb-6 sm:mb-8">
                <div className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/8 text-primary text-xs sm:text-sm font-bold shrink-0 mt-0.5 border border-primary/10">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-serif font-bold text-primary leading-snug">{lesson.title}</h2>
                  <div className="flex items-center gap-3 mt-2.5">
                    {lesson.duration && <span className="text-xs text-muted-foreground/60">{lesson.duration}</span>}
                    {isLoggedIn && (
                      <button
                        onClick={() => onToggleComplete(lesson.id)}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          isLessonCompleted(lesson.id) ? "text-green-600" : "text-muted-foreground/50 hover:text-primary"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isLessonCompleted(lesson.id) ? "Completed" : "Mark complete"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Video */}
              {lesson.videoUrl && (
                <div className="mb-10 rounded-2xl overflow-hidden shadow-lg shadow-black/5 ring-1 ring-black/5">
                  <VideoPlayer url={lesson.videoUrl} onComplete={() => onToggleComplete(lesson.id)} initialTime={0} onProgress={() => {}} />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-4">
                <LessonNotes notes={lesson.notes} />
              </div>

              {/* Resources */}
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-4 flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5" /> Resources
                  </h3>
                  <div className="grid gap-3">
                    {lesson.resources.map((res: any) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-card/40 border border-border/20 rounded-2xl hover:bg-accent/5 hover:border-primary/15 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 border border-primary/10">
                          <ExternalLink className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-primary group-hover:underline">{res.title}</span>
                          {res.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{res.description}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {i < lessons.length - 1 && (
                <div className="mt-10 flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Wrap-Up Video */}
        {module.wrapUpVideoUrl && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-primary/30" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Wrap-Up</h3>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg shadow-black/5 ring-1 ring-black/5">
              <VideoPlayer url={module.wrapUpVideoUrl} onComplete={() => {}} initialTime={0} onProgress={() => {}} />
            </div>
          </div>
        )}

        <div className="mt-24 pb-16 text-center">
          <p className="text-[11px] text-muted-foreground/40 uppercase tracking-widest">End of module</p>
        </div>
      </div>
    </div>
  );
}

function LessonNotes({ notes }: { notes: string }) {
  if (!notes || !notes.trim()) return <p className="text-sm text-muted-foreground/50 italic">Content coming soon.</p>;
  const blocks = parseNotesToBlocks(notes);
  return <div className="space-y-4">{blocks.map((block, i) => <BlockDisplay key={i} block={block} />)}</div>;
}

function BlockDisplay({ block }: { block: { type: string; content: string; order?: number } }) {
  switch (block.type) {
    case "heading":
      return <h3 className="text-xl font-serif font-semibold text-primary/90 mt-10 mb-4 first:mt-0 leading-snug">{renderMarkdown(block.content)}</h3>;
    case "bullet_list":
      return <div className="flex items-start gap-3 pl-1"><span className="w-1 h-1 rounded-full bg-primary/30 mt-[9px] shrink-0" /><p className="text-base text-foreground/80 leading-relaxed">{renderMarkdown(block.content)}</p></div>;
    case "numbered_list":
      return <div className="flex items-start gap-3 pl-1"><span className="text-sm font-bold text-primary/50 mt-0.5 shrink-0 tabular-nums">{block.order}.</span><p className="text-base text-foreground/80 leading-relaxed">{renderMarkdown(block.content)}</p></div>;
    case "callout":
      return (
        <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl p-5 my-8">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-base text-foreground/80 leading-relaxed">{renderMarkdown(block.content)}</p>
          </div>
        </div>
      );
    case "quote":
      return <blockquote className="border-l-[3px] border-primary/25 pl-6 py-2 my-8 text-base text-foreground/60 italic leading-relaxed">{renderMarkdown(block.content)}</blockquote>;
    case "divider":
      return <div className="my-8 flex items-center gap-4"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" /></div>;
    default:
      return <p className="text-base text-foreground/80 leading-relaxed">{renderMarkdown(block.content)}</p>;
  }
}

function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    if (match[2]) parts.push(<strong key={key++} className="font-semibold text-foreground">{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={key++}>{match[3]}</em>);
    else if (match[4]) parts.push(<code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-[13px] font-mono">{match[4]}</code>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  return parts.length > 0 ? parts : text;
}

function parseNotesToBlocks(notes: string) {
  const lines = notes.split("\n");
  const blocks: { type: string; content: string; order?: number }[] = [];
  let listCounter = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t) { listCounter = 0; continue; }
    if (t.startsWith("### ")) blocks.push({ type: "heading", content: t.replace("### ", "") });
    else if (t.startsWith("## ")) blocks.push({ type: "heading", content: t.replace("## ", "") });
    else if (t.startsWith("# ")) blocks.push({ type: "heading", content: t.replace("# ", "") });
    else if (t.startsWith("- ") || t.startsWith("* ")) blocks.push({ type: "bullet_list", content: t.replace(/^[-*] /, "") });
    else if (/^\d+\.\s/.test(t)) { listCounter++; blocks.push({ type: "numbered_list", content: t.replace(/^\d+\.\s/, ""), order: listCounter }); }
    else if (t.startsWith("> [!tip] ")) blocks.push({ type: "callout", content: t.replace("> [!tip] ", "") });
    else if (t.startsWith("> ")) blocks.push({ type: "quote", content: t.replace("> ", "") });
    else if (t === "---") blocks.push({ type: "divider", content: "" });
    else { listCounter = 0; blocks.push({ type: "paragraph", content: t }); }
  }
  return blocks;
}

function CurriculumView({ content, onSelectModule }: { content: any[]; onSelectModule: (id: string) => void }) {
  const totalModules = content.reduce((sum: number, lvl: any) => sum + lvl.modules.length, 0);
  const totalLessons = content.reduce((sum: number, lvl: any) => sum + lvl.modules.reduce((s: number, mod: any) => s + mod.lessons.length, 0), 0);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="relative border-b border-border/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-primary/[0.02] to-transparent" />
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-10 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
          <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-5 ring-1 ring-primary/10">
            <Layers className="w-6 sm:w-7 h-6 sm:h-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-primary leading-tight mb-2 sm:mb-3">
            Course Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground/60">
            {totalModules} modules spanning {totalLessons} lessons
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-5 sm:mt-6 text-[10px] sm:text-[11px] text-muted-foreground/50 uppercase tracking-wider font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
              Level 1: Foundations
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
              Level 2: Preparation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
              Level 3: Collaboration
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-10 py-10 sm:py-14 space-y-12 sm:space-y-14">
        {content.map((level: any, li: number) => {
          return (
          <section key={level.id}>
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${li === 0 ? "bg-primary/10" : li === 1 ? "bg-amber-400/10" : "bg-blue-400/10"}`}>
                <span className={`text-xs font-bold ${li === 0 ? "text-primary" : li === 1 ? "text-amber-600" : "text-blue-600"}`}>
                  {li + 1}
                </span>
              </div>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${li === 0 ? "text-primary/50" : li === 1 ? "text-amber-500/50" : "text-blue-500/50"}`}>
                  Level {li + 1}
                </span>
                <h2 className="text-xl font-serif font-bold text-primary -mt-0.5">{level.title}</h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent ml-auto max-w-[120px]" />
            </div>

            <div className="grid gap-5">
              {level.modules.map((mod: any, mi: number) => {
                const modNum = content.slice(0, li).reduce((s: number, l: any) => s + l.modules.length, 0) + mi + 1;
                return (
                <div key={mod.id} className="group relative">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative border border-border/20 rounded-2xl bg-card/40 hover:bg-card/60 hover:border-primary/15 hover:shadow-md hover:shadow-primary/[0.02] transition-all duration-200">
                    <button
                      onClick={() => onSelectModule(mod.id)}
                      className="flex items-center gap-4 w-full text-left p-5"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${li === 0 ? "bg-primary/[0.06] border-primary/10" : li === 1 ? "bg-amber-400/[0.06] border-amber-400/10" : "bg-blue-400/[0.06] border-blue-400/10"}`}>
                        <span className={`text-sm font-bold ${li === 0 ? "text-primary/60" : li === 1 ? "text-amber-600/60" : "text-blue-600/60"}`}>
                          {String(modNum).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-serif font-semibold text-primary group-hover:text-primary/80 transition-colors">
                          {formatModuleTitle(mod)}
                        </h3>
                        <p className="text-xs text-muted-foreground/50 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
                          </span>
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full border border-border/30 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all shrink-0">
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                      </div>
                    </button>

                    {mod.lessons.length > 0 && (
                      <div className="border-t border-border/10 mx-5 pb-2">
                        {mod.lessons.map((lesson: any, i: number) => (
                          <button
                            key={lesson.id}
                            onClick={() => onSelectModule(mod.id)}
                            className="flex items-center gap-3 w-full text-left py-2.5 px-2 hover:bg-accent/10 rounded-lg transition-colors group/lesson"
                          >
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${li === 0 ? "bg-primary/[0.04] text-primary/40" : li === 1 ? "bg-amber-400/[0.04] text-amber-600/40" : "bg-blue-400/[0.04] text-blue-600/40"}`}>
                              {i + 1}
                            </span>
                            <span className="text-sm text-foreground/60 group-hover/lesson:text-primary transition-colors truncate">
                              {lesson.title}
                            </span>
                            {lesson.duration && (
                              <span className="text-[10px] text-muted-foreground/30 ml-auto shrink-0">
                                {lesson.duration}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </section>
        )})}
      </div>
    </div>
  );
}

function findModule(content: any[], moduleId: string | null): any | null {
  if (!moduleId) return null;
  for (const level of content) for (const mod of level.modules || []) if (mod.id === moduleId) return mod;
  return null;
}
