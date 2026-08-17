"use client";

import { useState } from "react";
import {
  createLevel,
  updateLevel,
  deleteLevel,
  createModule,
  deleteModule,
  updateModuleLevel,
  deleteLesson,
  reorderLesson,
  toggleModuleVisibility,
} from "@/app/actions";
import { formatModuleTitle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Loader2, Layers, Folder, FileText, Trash2, Check, X,
  ChevronRight, ChevronDown, Eye, EyeOff, MoreVertical, Move,
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import type { CourseLevel, CourseModule, CourseLesson } from "@/lib/types";

interface CurriculumTreeProps {
  content: CourseLevel[];
  selection: { type: "module" | "lesson"; id: string } | null;
  onSelectModule: (moduleId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  onRefetch: () => void | Promise<void>;
  onAddLesson: (moduleId: string) => void;
  searchQuery?: string;
  statusFilter?: "all" | "published" | "draft";
  videoFilter?: "all" | "requires_video" | "no_video";
}

export default function CurriculumTree({
  content, selection, onSelectModule, onSelectLesson, onRefetch, onAddLesson,
  searchQuery = "", statusFilter = "all", videoFilter = "all",
}: CurriculumTreeProps) {
  const [isActionPending, setIsActionPending] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const toggleCollapse = (id: string) => setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));

  const hasActiveFilter = searchQuery.trim() !== "" || statusFilter !== "all" || videoFilter !== "all";
  const matchesFilters = (lesson: CourseLesson) => {
    const matchesSearch = !searchQuery.trim() || lesson.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesStatus = statusFilter === "all" || (statusFilter === "published" && lesson.isPublished) || (statusFilter === "draft" && !lesson.isPublished);
    const matchesVideo = videoFilter === "all" || (videoFilter === "requires_video" && lesson.hasVideo) || (videoFilter === "no_video" && !lesson.hasVideo);
    return matchesSearch && matchesStatus && matchesVideo;
  };

  const withPending = async (key: string, fn: () => Promise<void>, errorMessage: string) => {
    setIsActionPending(key);
    try {
      await fn();
      await onRefetch();
    } catch {
      showError(errorMessage);
    } finally {
      setIsActionPending(null);
    }
  };

  const handleCreateLevel = () => {
    const title = prompt("Enter new Level title:");
    if (!title) return;
    withPending("create-level", async () => { await createLevel(title); showSuccess("Level created"); }, "Failed to create level");
  };

  const startEditingLevel = (level: CourseLevel) => {
    setEditingLevelId(level.id);
    setEditingText(level.title);
  };

  const handleRenameLevel = (levelId: string) => {
    if (!editingText.trim()) return;
    withPending(levelId, async () => { await updateLevel(levelId, editingText); setEditingLevelId(null); showSuccess("Level renamed"); }, "Failed to rename level");
  };

  const handleDeleteLevel = (levelId: string) => {
    if (!confirm("Delete this Level? Modules inside will be unassigned, not deleted. This cannot be undone.")) return;
    withPending(levelId, async () => { await deleteLevel(levelId); showSuccess("Level deleted"); }, "Failed to delete level");
  };

  const handleCreateModule = (levelId: string) => {
    const title = prompt("Enter new Module title:");
    if (!title) return;
    withPending(`create-module-${levelId}`, async () => { await createModule(title, levelId); showSuccess("Module created"); }, "Failed to create module");
  };

  const handleMoveModule = (moduleId: string, levelId: string | null) => {
    withPending(`move-${moduleId}`, async () => { await updateModuleLevel(moduleId, levelId); showSuccess("Module moved"); }, "Failed to move module");
  };

  const handleDeleteModule = (moduleId: string) => {
    if (!confirm("Delete this Module? All lessons inside will be permanently deleted. This cannot be undone.")) return;
    withPending(moduleId, async () => { await deleteModule(moduleId); showSuccess("Module deleted"); }, "Failed to delete module");
  };

  const handleTogglePublish = (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    withPending(`publish-${moduleId}`, async () => {
      const result = await toggleModuleVisibility(moduleId);
      showSuccess(result.isPublished ? "Module published" : "Module hidden");
    }, "Failed to toggle module visibility");
  };

  const handleDeleteLesson = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this Lesson? This cannot be undone.")) return;
    withPending(lessonId, async () => { await deleteLesson(lessonId); showSuccess("Lesson deleted"); }, "Failed to delete lesson");
  };

  const handleReorderLesson = (e: React.MouseEvent, lessonId: string, direction: "up" | "down") => {
    e.stopPropagation();
    withPending(`reorder-${lessonId}`, async () => { await reorderLesson(lessonId, direction); }, "Failed to reorder lesson");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Curriculum
        </h2>
        <Button size="sm" variant="ghost" onClick={handleCreateLevel} disabled={isActionPending === "create-level"} className="h-7 text-[11px] px-2">
          {isActionPending === "create-level" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
          Level
        </Button>
      </div>

      {content.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-4 text-center">No levels yet.</p>
      ) : (
        content.map((level) => {
          const levelHasMatch = hasActiveFilter && level.modules.some((m) => m.lessons.some(matchesFilters));
          const isLevelCollapsed = levelHasMatch ? false : collapsedNodes[level.id];
          const isEditingLevel = editingLevelId === level.id;
          return (
            <div key={level.id} className="rounded-lg border border-border/50 overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5 bg-primary/5">
                <button onClick={() => toggleCollapse(level.id)} className="p-0.5 rounded hover:bg-primary/10 text-primary shrink-0 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none" aria-label={isLevelCollapsed ? "Expand level" : "Collapse level"}>
                  {isLevelCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {isEditingLevel ? (
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <Input value={editingText} onChange={(e) => setEditingText(e.target.value)} className="h-6 text-xs" autoFocus />
                    <button onClick={() => handleRenameLevel(level.id)} className="p-0.5 text-green-600 hover:bg-green-500/10 rounded shrink-0 focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:outline-none" aria-label="Confirm rename"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingLevelId(null)} className="p-0.5 text-destructive hover:bg-destructive/10 rounded shrink-0 focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:outline-none" aria-label="Cancel rename"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <span onClick={() => startEditingLevel(level)} className="flex-1 min-w-0 truncate text-xs font-bold text-primary cursor-text hover:underline">
                    {level.title}
                  </span>
                )}
                <button onClick={() => handleCreateModule(level.id)} className="p-0.5 rounded hover:bg-primary/10 text-primary/70 shrink-0 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none" title="Add module" aria-label="Add module">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDeleteLevel(level.id)} className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0 focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:outline-none" title="Delete level" aria-label="Delete level">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {!isLevelCollapsed && (
                <div className="p-1.5 space-y-1 bg-background">
                  {level.modules.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic pl-6 py-1">No modules yet.</p>
                  ) : (
                    level.modules.map((module: CourseModule) => {
                      const visibleLessons = hasActiveFilter ? module.lessons.filter(matchesFilters) : module.lessons;
                      const moduleHasMatch = hasActiveFilter && visibleLessons.length > 0;
                      const isModuleCollapsed = moduleHasMatch ? false : collapsedNodes[module.id];
                      const isModuleSelected = selection?.type === "module" && selection.id === module.id;
                      return (
                        <div key={module.id} className="rounded-md border border-border/40">
                          <div
                            onClick={() => onSelectModule(module.id)}
                            className={`flex items-center gap-1 px-1.5 py-1.5 rounded-t-md cursor-pointer transition-colors ${
                              isModuleSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent/40"
                            }`}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleCollapse(module.id); }}
                              className={`p-0.5 rounded shrink-0 ${isModuleSelected ? "hover:bg-primary-foreground/10" : "hover:bg-accent"} focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none`}
                              aria-label={isModuleCollapsed ? "Expand module" : "Collapse module"}
                            >
                              {isModuleCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <Folder className={`w-3.5 h-3.5 shrink-0 ${isModuleSelected ? "text-primary-foreground" : "text-amber-600"}`} />
                            <span className="flex-1 min-w-0 truncate text-xs font-medium">{formatModuleTitle(module)}</span>
                            <button
                              onClick={(e) => handleTogglePublish(e, module.id)}
                              className={`shrink-0 p-0.5 rounded ${isModuleSelected ? "text-primary-foreground/80 hover:bg-primary-foreground/10" : module.isPublished ? "text-green-600 hover:bg-green-500/10" : "text-muted-foreground/50 hover:bg-accent"} focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none`}
                              title={module.isPublished ? "Click to hide" : "Click to publish"}
                              aria-label={module.isPublished ? "Hide module" : "Publish module"}
                            >
                              {module.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <button className={`shrink-0 p-0.5 rounded ${isModuleSelected ? "hover:bg-primary-foreground/10" : "hover:bg-accent"} focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none`} aria-label="Module options">
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => onAddLesson(module.id)}>
                                  <Plus className="w-3.5 h-3.5 mr-2" /> Add Lesson
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Move className="w-3.5 h-3.5 mr-2" /> Move to Level
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleMoveModule(module.id, null)}>Unassigned</DropdownMenuItem>
                                    {content.map((lvl) => (
                                      <DropdownMenuItem key={lvl.id} onClick={() => handleMoveModule(module.id, lvl.id)}>
                                        {lvl.title}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteModule(module.id)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Module
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {!isModuleCollapsed && (
                            <div className="p-1 space-y-0.5">
                              {visibleLessons.length === 0 ? (
                                <p className="text-[11px] text-muted-foreground italic pl-6 py-1">
                                  {module.lessons.length === 0 ? "No lessons yet." : "No lessons match the current filters."}
                                </p>
                              ) : (
                                  visibleLessons.map((lesson: CourseLesson) => {
                                  const isLessonSelected = selection?.type === "lesson" && selection.id === lesson.id;
                                  return (
                                    <div
                                      key={lesson.id}
                                      onClick={() => onSelectLesson(lesson.id)}
                                      className={`flex items-center gap-1 pl-6 pr-1 py-1 rounded cursor-pointer group transition-colors ${
                                        isLessonSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent/40"
                                      }`}
                                    >
                                      <FileText className="w-3 h-3 shrink-0 text-muted-foreground" />
                                      <span className="flex-1 min-w-0 truncate text-[11px]">{lesson.title}</span>
                                      <Badge variant={lesson.isPublished ? "default" : "secondary"} className={`h-4 text-[9px] px-1 shrink-0 ${lesson.isPublished ? "bg-green-500/10 text-green-700 border-green-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20"}`}>
                                        {lesson.isPublished ? "Live" : "Draft"}
                                      </Badge>
                                      <div className="hidden group-hover:flex items-center shrink-0">
                                         <button onClick={(e) => handleReorderLesson(e, lesson.id, "up")} className="p-0.5 rounded hover:bg-accent text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none" title="Move up" aria-label="Move lesson up">
                                           <ChevronRight className="w-3 h-3 -rotate-90" />
                                         </button>
                                         <button onClick={(e) => handleReorderLesson(e, lesson.id, "down")} className="p-0.5 rounded hover:bg-accent text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none" title="Move down" aria-label="Move lesson down">
                                           <ChevronRight className="w-3 h-3 rotate-90" />
                                         </button>
                                         <button onClick={(e) => handleDeleteLesson(e, lesson.id)} className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:outline-none" title="Delete lesson" aria-label="Delete lesson">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
