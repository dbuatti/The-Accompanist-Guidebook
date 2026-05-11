"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCourseContent, updateLesson, createModule, createLesson } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import AdminNav from "@/components/AdminNav";
import { authClient } from "@/lib/auth/client";

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
    // Simple admin check - you might want to check the 'role' field from the DB instead
    if (session && session.user.email !== "admin@accompanist.com") {
      router.push("/portal");
      return;
    }
    fetchContent();
  }, [session, isAuthPending, router]);

  const fetchContent = async () => {
    try {
      const data = await getCourseContent();
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
        notes: lessonData.notes,
        duration: lessonData.duration
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
        title: "New Lesson",
        videoUrl: "",
        duration: "00:00",
        notes: ""
      });
      fetchContent();
      showSuccess("Lesson added");
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
        <h2 className="text-xl font-serif font-semibold text-primary">Course Structure</h2>
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
                <Plus className="w-4 h-4 mr-2" /> Add Lesson
              </Button>
            </div>

            <div className="grid gap-6">
              {module.lessons.map((lesson: any) => (
                <Card key={lesson.id} className="bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      Editing: {lesson.title}
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateLesson(lesson.id, lesson)}
                        disabled={isSaving === lesson.id}
                      >
                        {isSaving === lesson.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Title</label>
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
                        <label className="text-xs text-muted-foreground">Duration</label>
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
                      <label className="text-xs text-muted-foreground">Video URL (YouTube)</label>
                      <Input 
                        value={lesson.videoUrl} 
                        onChange={(e) => {
                          const newContent = [...content];
                          const modIdx = newContent.findIndex(m => m.id === module.id);
                          const lesIdx = newContent[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                          newContent[modIdx].lessons[lesIdx].videoUrl = e.target.value;
                          setContent(newContent);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Lesson Notes</label>
                      <Textarea 
                        rows={4}
                        value={lesson.notes} 
                        onChange={(e) => {
                          const newContent = [...content];
                          const modIdx = newContent.findIndex(m => m.id === module.id);
                          const lesIdx = newContent[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                          newContent[modIdx].lessons[lesIdx].notes = e.target.value;
                          setContent(newContent);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}