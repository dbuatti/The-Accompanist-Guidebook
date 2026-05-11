"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { courseData } from "@/data/courseData";
import { Lesson } from "@/types/course";
import VideoPlayer from "@/components/VideoPlayer";
import PlaylistSidebar from "@/components/PlaylistSidebar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LogOut, Menu, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getProgress, toggleLessonProgress } from "@/app/actions";

export default function PortalPage() {
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState<Lesson>(courseData[0].lessons[0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("auth_session");
    if (!session) {
      router.push("/login");
      return;
    }
    setUserId(session);

    const fetchProgress = async () => {
      try {
        const progress = await getProgress(session);
        setCompletedLessons(progress);
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [router]);

  const handleToggleComplete = async (lessonId: string) => {
    if (!userId) return;

    try {
      const result = await toggleLessonProgress(userId, lessonId);
      if (result.completed) {
        setCompletedLessons(prev => [...prev, lessonId]);
        showSuccess("Lesson marked as complete!");
      } else {
        setCompletedLessons(prev => prev.filter(id => id !== lessonId));
      }
    } catch (error) {
      showError("Failed to update progress.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_session");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden lg:block w-80 h-full">
        <PlaylistSidebar
          modules={courseData}
          currentLessonId={currentLesson.id}
          completedLessons={completedLessons}
          onSelectLesson={setCurrentLesson}
        />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/30 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <PlaylistSidebar
                  modules={courseData}
                  currentLessonId={currentLesson.id}
                  completedLessons={completedLessons}
                  onSelectLesson={(lesson) => {
                    setCurrentLesson(lesson);
                  }}
                />
              </SheetContent>
            </Sheet>
            <h1 className="font-serif text-lg font-semibold text-primary hidden sm:block">
              The Accompanist Guidebook
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-primary">
            <LogOut className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full space-y-8">
          <div className="space-y-4">
            <VideoPlayer 
              url={currentLesson.videoUrl} 
              onComplete={() => {
                if (!completedLessons.includes(currentLesson.id)) {
                  handleToggleComplete(currentLesson.id);
                }
              }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                  {currentLesson.title}
                </h2>
                <p className="text-muted-foreground mt-1">Duration: {currentLesson.duration}</p>
              </div>
              <Button
                onClick={() => handleToggleComplete(currentLesson.id)}
                variant={completedLessons.includes(currentLesson.id) ? "default" : "outline"}
                className={completedLessons.includes(currentLesson.id) ? "bg-accent hover:bg-accent/90" : "border-primary text-primary hover:bg-primary/5"}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {completedLessons.includes(currentLesson.id) ? "Completed" : "Mark as Complete"}
              </Button>
            </div>
          </div>

          <div className="prose prose-stone max-w-none bg-card/50 p-8 rounded-2xl border border-border/50 shadow-sm">
            <h3 className="text-xl font-serif font-semibold text-primary mb-4 border-b border-border/50 pb-2">
              Lesson Notes
            </h3>
            <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap font-sans">
              {currentLesson.notes}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}