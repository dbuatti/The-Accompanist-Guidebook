"use client";

import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Module, Lesson } from "../types/course";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlaylistSidebarProps {
  modules: Module[];
  currentLessonId: string;
  completedLessons: string[];
  onSelectLesson: (lesson: Lesson) => void;
}

const PlaylistSidebar = ({
  modules,
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
        <div className="p-4 space-y-6">
          {modules.map((module) => (
            <div key={module.id} className="space-y-2">
              <h3 className="px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                {module.title}
              </h3>
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
      </ScrollArea>
    </div>
  );
};

export default PlaylistSidebar;