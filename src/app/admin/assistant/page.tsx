"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCourseContent, scaffoldAuditionGuidebook } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, BookOpen, BrainCircuit, CheckCircle2, Copy, Check, ArrowRight, HelpCircle } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import AdminNav from "@/components/AdminNav";
import { authClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";

const ADMIN_EMAILS = ["admin@accompanist.com", "daniele.buatti@gmail.com"];

export default function AdminAssistantPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/auth/sign-in");
      return;
    }
    if (session && (!session.user.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase()))) {
      router.push("/modules");
      return;
    }
    fetchContent();
  }, [session, isAuthPending, router]);

  const fetchContent = async () => {
    try {
      const data = await getCourseContent(true);
      setContent(data);
      
      // Select first lesson by default if available
      if (data.length > 0 && data[0].modules.length > 0 && data[0].modules[0].lessons.length > 0) {
        setSelectedLesson(data[0].modules[0].lessons[0]);
      }
    } catch (error) {
      showError("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScaffold = async () => {
    if (!confirm("This will automatically create all 13 modules and populate them with beautifully structured lesson drafts containing your guidebook outlines. Are you sure you want to proceed?")) return;

    setIsScaffolding(true);
    try {
      await scaffoldAuditionGuidebook();
      showSuccess("13-Module Curriculum scaffolded successfully!");
      await fetchContent();
    } catch (error) {
      showError("Failed to scaffold curriculum");
    } finally {
      setIsScaffolding(false);
    }
  };

  const getAIPrompt = (lesson: any) => {
    if (!lesson) return "";
    return `You are Daniele Buatti, a professional Music Director, Audition Pianist, and Voice Coach. 
I want you to write a comprehensive, engaging, and highly practical lesson for my "Audition Guidebook" course.

LESSON TITLE: "${lesson.title}"
CURRENT OUTLINE / NOTES:
${lesson.notes || "No notes written yet."}

BACK-END DRAFT NOTES / BRAIN DUMP:
${lesson.adminNotes || "No private draft notes written yet."}

Please write the complete, client-facing lesson notes. Use a warm, professional, and encouraging tone. Include:
1. A clear, practical explanation of the concept.
2. Real-world audition room examples or stories.
3. A "Daniele's Pro-Tip" callout box.
4. Actionable steps the student can take right now to prepare.`;
  };

  const handleCopyPrompt = async () => {
    if (!selectedLesson) return;
    try {
      await navigator.clipboard.writeText(getAIPrompt(selectedLesson));
      setCopiedPrompt(true);
      showSuccess("AI Prompt copied to clipboard!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      showError("Failed to copy prompt.");
    }
  };

  if (isLoading || isAuthPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const hasContent = content.length > 0;

  return (
    <div className="min-h-screen bg-background p-8 max-w-5xl mx-auto">
      <AdminNav />

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-primary flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-accent" />
            AI Content Assistant & Planner
          </h2>
          <p className="text-sm text-muted-foreground">
            Scaffold your 13-module curriculum instantly and use the AI Copilot to write your lessons.
          </p>
        </div>
        {!hasContent && (
          <Button onClick={handleScaffold} disabled={isScaffolding} className="bg-primary hover:bg-primary/90">
            {isScaffolding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scaffolding 13 Modules...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 text-amber-400 fill-amber-400" />
                One-Click Course Scaffolder
              </>
            )}
          </Button>
        )}
      </div>

      {!hasContent ? (
        <Card className="bg-card/50 border-dashed border-2 border-border/80 p-12 text-center max-w-2xl mx-auto">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-accent fill-accent" />
            </div>
            <CardTitle className="text-2xl font-serif font-bold text-primary">
              Scaffold Your Audition Guidebook
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              You haven't populated your 13-module curriculum yet. Click the button below to automatically generate all 13 modules and their lesson drafts with your guidebook outlines!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button onClick={handleScaffold} disabled={isScaffolding} size="lg" className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg rounded-xl shadow-md">
              {isScaffolding ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Generating 13 Modules & Drafts...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3 text-amber-400 fill-amber-400" />
                  Generate 13-Module Curriculum
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column: Lesson Selector */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">
              Select Lesson to Write
            </h3>
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 border border-border/50 rounded-xl p-3 bg-card/30">
              {content.map((level) => (
                <div key={level.id} className="space-y-3">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-1 rounded border border-primary/10">
                    {level.title}
                  </div>
                  <div className="space-y-4 pl-1">
                    {level.modules.map((module: any) => (
                      <div key={module.id} className="space-y-1">
                        <div className="text-[11px] font-semibold text-muted-foreground/80 px-2">
                          {module.title}
                        </div>
                        <div className="space-y-0.5">
                          {module.lessons.map((lesson: any) => {
                            const isSelected = selectedLesson?.id === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLesson(lesson)}
                                className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                    : "hover:bg-secondary/50 text-foreground/80"
                                }`}
                              >
                                {lesson.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: AI Copilot & Prompt Generator */}
          <div className="md:col-span-2 space-y-6">
            {selectedLesson ? (
              <Card className="bg-card/50 border-border/50 shadow-sm">
                <CardHeader className="pb-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                      AI Lesson Copilot
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleCopyPrompt} className="border-border/80 hover:bg-primary/5 hover:text-primary">
                      {copiedPrompt ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          Copied Prompt
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy AI Prompt
                        </>
                      )}
                    </Button>
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-primary mt-3">
                    {selectedLesson.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    Use this tailored prompt with Claude or ChatGPT to generate complete, professional lesson notes instantly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Current Outlines */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <div className="flex items-center gap-2 text-primary">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Current Outline</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
                        {selectedLesson.notes || "No notes written yet."}
                      </p>
                    </div>

                    <div className="space-y-2 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                      <div className="flex items-center gap-2 text-amber-700">
                        <BrainCircuit className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Back-End Draft Notes</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
                        {selectedLesson.adminNotes || "No private draft notes written yet."}
                      </p>
                    </div>
                  </div>

                  {/* Tailored AI Prompt Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Tailored AI Prompt
                      </span>
                      <span className="text-[10px] text-muted-foreground italic">
                        Click "Copy AI Prompt" above to copy this entire prompt
                      </span>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl border border-border/50 font-mono text-xs text-foreground/80 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                      {getAIPrompt(selectedLesson)}
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-accent/5 p-4 rounded-xl border border-accent/10 flex gap-3 items-start">
                    <HelpCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-accent uppercase tracking-wider">How to use the Copilot</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Copy the prompt above, paste it into Claude or ChatGPT, and let it write the lesson for you. Once generated, you can paste the result directly into the **Client-Facing Notes** on the **Course Content** tab!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-xl text-muted-foreground italic">
                Select a lesson from the left to launch the AI Copilot.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}