"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCourseContent, updateLesson, createModule, createLesson } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Save, Loader2, Eye, EyeOff, BookOpen, BrainCircuit } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import AdminNav from "@/components/AdminNav";
import { authClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";

const ADMIN_EMAILS = ["admin@accompanist.com", "daniele.buatti@gmail.com"];

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/auth/sign-in");
      return;
    }
    if (session && (!session.user.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase()))) {
      router.push("/portal");
      return;
    }
    fetchContent();
  }, [session, isAuthPending, router]);

  const fetchContent = async () => {
    try {
      const data = await getCourseContent(true); // Pass true to fetch all lessons (including drafts)
      setContent(data);
    } catch (error) {
      showError("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLesson = async (lessonId: string, lessonData: any) => {
    setIsSaving(lessonId);
    try {
      await updateLesson(lessonId, {
        title: lessonData.title,
        videoUrl: lessonData.videoUrl,
        notes: lessonData.notes || "",
        adminNotes: lessonData.adminNotes || "",
        isPublished: lessonData.isPublished ?? false,
        duration: lessonData.duration || "00:00"
      });
      showSuccess("Lesson updated successfully");
    } catch (error) {
      showError("Failed to update lesson");
    } finally {
      setIsSaving(null);
    }
  };

  const handleAddModule = async () => {
    const title = prompt("Enter module title:");
    if (!title) return;
    try {
      await createModule(title);
      fetchContent();
      showSuccess("Module created");
    } catch (error) {
      showError("Failed to create module");
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    try {
      await createLesson(moduleId, {
        title: "New Lesson Draft",
        videoUrl: "",
        duration: "00:00",
        notes: "",
        adminNotes: "",
        isPublished: false // Default to draft
      });
      fetchContent();
      showSuccess("Lesson draft added");
    } catch (error) {
      showError("Failed to add lesson");
    }
  };

  if (isLoading || isAuthPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 max-w-5xl mx-auto">
      <AdminNav />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-serif font-semibold text-primary">Course Structure & Drafts</h2>
          <p className="text-sm text-muted-foreground">Draft lessons, brain dump ideas, and publish when ready.</p>
        </div>
        <Button onClick={handleAddModule} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Module
        </Button>
      </div>

      <div className="space-y-12">
        {content.map((module) => (
          <div key={module.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-lg font-serif font-medium">{module.title}</h3>
              <Button variant="outline" size="sm" onClick={() => handleAddLesson(module.id)}>
                <Plus className="w-4 h-4 mr-2" /> Add Lesson Draft
              </Button>
            </div>

            <div className="grid gap-6">
              {module.lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground italic pl-2">No lessons in this module yet.</p>
              ) : (
                module.lessons.map((lesson: any) => (
                  <Card key={lesson.id} className="bg-card/50 border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base font-serif font-bold text-primary">
                            {lesson.title || "Untitled Lesson"}
                          </CardTitle>
                          {lesson.isPublished ? (
                            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/10 flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/10 flex items-center gap-1">
                              <EyeOff className="w-3 h-3" /> Draft
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`publish-${lesson.id}`}
                              checked={lesson.isPublished}
                              onCheckedChange={(checked) => {
                                const newContent = [...content];
                                const modIdx = newContent.findIndex(m => m.id === module.id);
                                const lesIdx = newContent[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                                newContent[modIdx].lessons[lesIdx].isPublished = checked;
                                setContent(newContent);
                              }}
                            />
                            <Label htmlFor={`publish-${lesson.id}`} className="text-xs font-medium cursor-pointer">
                              {lesson.isPublished ? "Published" : "Draft"}
                            </Label>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateLesson(lesson.id, lesson)}
                            disabled={isSaving === lesson.id}
                          >
                            {isSaving === lesson.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Lesson Title</label>
                          <Input 
                            value={lesson.title} 
                            onChange={(e) => {
                              const newContent = [...content];
                              const modIdx = newContent.findIndex(m => m.id === module.id);
                              const lesIdx = newContent[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                              newContent[modIdx].lessons[lesIdx].title = e.target.value;
                              setContent(newContent);
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Duration (e.g., 08:45)</label>
                          <Input 
                            value={lesson.duration} 
                            onChange={(e) => {
                              const newContent = [...content];
                              const modIdx = newContent.findIndex(m => m.id === module.id);
                              const lesIdx = newContent[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                              newContent[modIdx].lessons[lesIdx].duration = e.target.value;
                              setContent(newContent);
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Video URL (YouTube)</label>
                        <Input 
                          value={lesson.videoUrl} 
                          placeholder="https://www.youtube.com/watch?v=..."
                          onChange={(e) => {
                            const newContent = [...content];
                            const modIdx = newContent.findIndex(m => m.id === module.id);
                            const lesIdx = newContent[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                            newContent[modIdx].lessons[lesIdx].videoUrl = e.target.value;
                            setContent(newContent);
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Client-Facing Notes */}
                        <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
                          <div className="flex items-center gap-2 text-primary">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Client-Facing Notes</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">These notes are visible to students in the portal.</p>
                          <Textarea 
                            rows={6}
                            placeholder="Write notes, summaries, or instructions for your students..."
                            value={lesson.notes || ""} 
                            onChange={(e) => {
                              const newContent = [...content];
                              const modIdx = newContent.findIndex(m => m.id === module.id);
                              const lesIdx = newContent[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                              newContent[modIdx].lessons[lesIdx].notes = e.target.value;
                              setContent(newContent);
                            }}
                            className="bg-background border-border/80"
                          />
                        </div>

                        {/* Back-End / Draft Notes */}
                        <div className="space-y-2 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                          <div className="flex items-center gap-2 text-amber-700">
                            <BrainCircuit className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Back-End / Draft Notes</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">Private brain dumps, outlines, and raw ideas. Only visible to admins.</p>
                          <Textarea 
                            rows={6}
                            placeholder="Brain dump your ideas, curriculum outlines, or raw thoughts here..."
                            value={lesson.adminNotes || ""} 
                            onChange={(e) => {
                              const newContent = [...content];
                              const modIdx = newContent.findIndex(m => m.id === module.id);
                              const lesIdx = newContent[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                              newContent[modIdx].lessons[lesIdx].adminNotes = e.target.value;
                              setContent(newContent);
                            }}
                            className="bg-background border-border/80"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}