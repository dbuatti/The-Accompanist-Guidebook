"use client";

import { CheckCircle2, Circle, PlayCircle, Layers } from "lucide-react";
import { cn, formatModuleTitle } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  notes: string;
}

interface Module {
  id: string;
  title: string;
  moduleNumber?: number;
  lessons: Lesson[];
}

interface Level {
  id: string;
  title: string;
  modules: Module[];
}

interface PlaylistSidebarProps {
  modules: Level[]; // This is now Levels containing Modules
  currentLessonId: string;
  completedLessons: string[];
  onSelectLesson: (lesson: any) => void;
}

const PlaylistSidebar = ({
  modules: levels,
  currentLessonId,
  completedLessons,
  onSelectLesson,
}: PlaylistSidebarProps) => {
  return (
    <div className="flex flex-col h-full bg-card/50 border-l border-border/50">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-xl font-serif font-semibold text-primary">Course Content</h2>
        <p className="text-sm text-muted-foreground mt-1">Maybe This Time</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          {levels.map((level) => (
            <div key={level.id} className="space-y-4">
              {/* Tier 1: Level Header */}
              <div className="flex items-center gap-2 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {level.title}
                </h3>
              </div>

              <div className="space-y-6 pl-2">
                {level.modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    {/* Tier 2: Module Header */}
                    <h4 className="px-2 text-xs font-semibold text-muted-foreground/80">
                      {formatModuleTitle(module)}
                    </h4>

                    {/* Tier 3: Lessons */}
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => {
                        const isActive = lesson.id === currentLessonId;
                        const isCompleted = completedLessons.includes(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => onSelectLesson(lesson)}
                            className={cn(
                              "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left group",
                              isActive 
                                ? "bg-primary text-primary-foreground shadow-md" 
                                : "hover:bg-secondary/50 text-foreground"
                            )}
                          >
                            <div className="mt-0.5">
                              {isCompleted ? (
                                <CheckCircle2 className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-accent")} />
                              ) : isActive ? (
                                <PlayCircle className="w-5 h-5 text-primary-foreground" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight truncate">
                                {lesson.title}
                              </p>
                              <p className={cn(
                                "text-xs mt-1",
                                isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {lesson.duration}
                              </p>
                            </div>
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
      </ScrollArea>
    </div>
  );
};

export default PlaylistSidebar;