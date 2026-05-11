"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import PlaylistSidebar from "@/components/PlaylistSidebar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LogOut, Menu, Loader2, Settings } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getProgress, toggleLessonProgress, getCourseContent, saveVideoProgress } from "@/app/actions";
import Link from "next/link";

export default function PortalPage() {
  const router = useRouter();
  const [courseData, setCourseData] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("auth_session");
    const role = localStorage.getItem("auth_role");
    
    if (!session) {
      router.push("/login");
      return;
    }
    setUserId(session);
    setIsAdmin(role === "admin");

    const fetchData = async () => {
      try {
        const [progress, content] = await Promise.all([
          getProgress(session),
          getCourseContent()
        ]);
        
        setProgressData(progress);
        setCourseData(content);
        
        if (content.length > 0 && content[0].lessons.length > 0) {
          setCurrentLesson(content[0].lessons[0]);
        }
      } catch (error) {
        console.error("PortalPage: Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleToggleComplete = async (lessonId: string) => {
    if (!userId) return;

    try {
      const result = await toggleLessonProgress(userId, lessonId);
      const updatedProgress = await getProgress(userId);
      setProgressData(updatedProgress);
      
      if (result.completed) {
        showSuccess("Lesson marked as complete!");
      }
    } catch (error) {
      showError("Failed to update progress.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_session");
    localStorage.removeItem("auth_role");
    router.push("/login");
  };

  const isLessonCompleted = (lessonId: string) => {
    return progressData.some(p => p.lessonId === lessonId && p.completedAt);
  };

  const getLessonPosition = (lessonId: string) => {
    return progressData.find(p => p.lessonId === lessonId)?.lastPosition || 0;
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background space-y-4">
        <p className="text-muted-foreground">No content available yet.</p>
        {isAdmin && (
          <Link href="/admin">
            <Button>Go to Admin Dashboard</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden lg:block w-80 h-full">
        <PlaylistSidebar
          modules={courseData}
          currentLessonId={currentLesson.id}
          completedLessons={progressData.filter(p => p.completedAt).map(p => p.lessonId)}
          onSelectLesson={(lesson) => setCurrentLesson(lesson)}
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
                  completedLessons={progressData.filter(p => p.completedAt).map(p => p.lessonId)}
                  onSelectLesson={(lesson) => setCurrentLesson(lesson)}
                />
              </SheetContent>
            </Sheet>
            <h1 className="font-serif text-lg font-semibold text-primary hidden sm:block">
              The Accompanist Guidebook
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-primary">
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full space-y-8">
          <div className="space-y-4">
            <VideoPlayer 
              key={currentLesson.id}
              url={currentLesson.videoUrl} 
              initialTime={getLessonPosition(currentLesson.id)}
              onProgress={(seconds) => {
                if (userId) saveVideoProgress(userId, currentLesson.id, seconds);
              }}
              onComplete={() => {
                if (!isLessonCompleted(currentLesson.id)) {
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
                variant={isLessonCompleted(currentLesson.id) ? "default" : "outline"}
                className={isLessonCompleted(currentLesson.id) 
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
                  : "border-primary text-primary hover:bg-primary/5 hover:text-primary"
                }
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isLessonCompleted(currentLesson.id) ? "Completed" : "Mark as Complete"}
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