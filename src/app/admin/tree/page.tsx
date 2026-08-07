"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getCourseContent, 
  createLevel, 
  updateLevel, 
  deleteLevel, 
  createModule, 
  updateModule, 
  deleteModule, 
  updateModuleLevel,
  createLesson,
  updateLesson,
  deleteLesson,
  getLevelsOnly,
  toggleModuleVisibility
} from "@/app/actions";
import { formatModuleTitle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Plus, Save, Loader2, Layers, Folder, FileText, Trash2, Edit2, Check, X, 
  ChevronRight, ChevronDown, GitFork, ArrowRight, Move, Eye, EyeOff
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import AdminNav from "@/components/AdminNav";
import { authClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { ADMIN_EMAILS } from "@/lib/admin";

export default function AdminTreePage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [content, setContent] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState<string | null>(null);

  // Inline Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Collapsed States
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/auth/sign-in");
      return;
    }
    if (session && (!session.user.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase()))) {
      router.push("/modules");
      return;
    }
    fetchData();
  }, [session, isAuthPending, router]);

  const fetchData = async () => {
    try {
      const [courseData, levelsData] = await Promise.all([
        getCourseContent(),
        getLevelsOnly()
      ]);
      setContent(courseData);
      setLevels(levelsData);
    } catch (error) {
      showError("Failed to load curriculum tree");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Level Actions ---
  const handleCreateLevel = async () => {
    const title = prompt("Enter new Level title:");
    if (!title) return;
    setIsActionPending("create-level");
    try {
      await createLevel(title);
      showSuccess("Level created successfully!");
      await fetchData();
    } catch (error) {
      showError("Failed to create level");
    } finally {
      setIsActionPending(null);
    }
  };

  const handleRenameLevel = async (levelId: string) => {
    if (!editingText.trim()) return;
    setIsActionPending(levelId);
    try {
      await updateLevel(levelId, editingText);
      showSuccess("Level renamed successfully!");
      setEditingId(null);
      await fetchData();
    } catch (error) {
      showError("Failed to rename level");
    } finally {
      setIsActionPending(null);
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!confirm("Are you sure you want to delete this Level? Modules inside will be unassigned, but not deleted. This cannot be undone.")) return;
    setIsActionPending(levelId);
    try {
      await deleteLevel(levelId);
      showSuccess("Level deleted successfully!");
      await fetchData();
    } catch (error) {
      showError("Failed to delete level");
    } finally {
      setIsActionPending(null);
    }
  };

  // --- Module Actions ---
  const handleCreateModule = async (levelId: string) => {
    const title = prompt("Enter new Module title:");
    if (!title) return;
    setIsActionPending(`create-module-${levelId}`);
    try {
      await createModule(title, levelId);
      showSuccess("Module created successfully!");
      await fetchData();
    } catch (error) {
      showError("Failed to create module");
    } finally {
      setIsActionPending(null);
    }
  };

  const handleRenameModule = async (moduleId: string) => {
    if (!editingText.trim()) return;
    setIsActionPending(moduleId);
    try {
      await updateModule(moduleId, editingText);
      showSuccess("Module renamed successfully!");
      setEditingId(null);
      await fetchData();
    } catch (error) {
      showError("Failed to rename module");
    } finally {
      setIsActionPending(null);
    }
  };

  const handleMoveModule = async (moduleId: string, levelId: string | null) => {
    setIsActionPending(`move-${moduleId}`);
    try {
      await updateModuleLevel(moduleId, levelId);
      showSuccess("Module moved successfully!");
      await fetchData();
    } catch (error) {
      showError("Failed to move module");
    } finally {
      setIsActionPending(null);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this Module? All lessons inside will be permanently deleted. This cannot be undone.")) return;
    setIsActionPending(moduleId);
    try {
      await deleteModule(moduleId);
      showSuccess("Module deleted successfully!");
      await fetchData();
    } catch (error) {
      showError("Failed to delete module");
    } finally {
      setIsActionPending(null);
    }
  };

  const handleToggleModulePublication = async (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    try {
      const result = await toggleModuleVisibility(moduleId);
      const newContent = content.map((level) => ({
        ...level,
        modules: level.modules.map((mod: any) =>
          mod.id === moduleId ? { ...mod, isPublished: result.isPublished } : mod
        ),
      }));
      setContent(newContent);
      showSuccess(result.isPublished ? "Module published" : "Module hidden");
    } catch {
      showError("Failed to toggle module visibility");
    }
  };

  // --- Lesson Actions ---
  const handleCreateLesson = async (moduleId: string) => {
    const title = prompt("Enter new Lesson title:");
    if (!title) return;
    setIsActionPending(`create-lesson-${moduleId}`);
    try {
      await createLesson(moduleId, {
        title,
        videoUrl: "",
        duration: "05:00",
        notes: "",
        adminNotes: "",
        isPublished: false,
        hasVideo: true,
        videoStatus: "not_started",
        filmingDate: null,
      });
      showSuccess("Lesson draft created successfully!");
      await fetchData();
    } catch (error) {
      showError("Failed to create lesson");
    } finally {
      setIsActionPending(null);
    }
  };

  const handleRenameLesson = async (lesson: any) => {
    if (!editingText.trim()) return;
    setIsActionPending(lesson.id);
    try {
      await updateLesson(lesson.id, {
        ...lesson,
        title: editingText,
      });
      showSuccess("Lesson renamed successfully!");
      setEditingId(null);
      await fetchData();
    } catch (error) {
      showError("Failed to rename lesson");
    } finally {
      setIsActionPending(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this Lesson? This cannot be undone.")) return;
    setIsActionPending(lessonId);
    try {
      await deleteLesson(lessonId);
      showSuccess("Lesson deleted successfully!");
      await fetchData();
    } catch (error) {
      showError("Failed to delete lesson");
    } finally {
      setIsActionPending(null);
    }
  };

  const startEditing = (id: string, currentText: string) => {
    setEditingId(id);
    setEditingText(currentText);
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

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold text-primary flex items-center gap-2">
            <GitFork className="w-5 h-5 text-accent" />
            Curriculum Tree Manager
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your entire course hierarchy (Levels, Modules, and Lessons) in one simple, nested view.
          </p>
        </div>
        <Button onClick={handleCreateLevel} disabled={isActionPending !== null} className="bg-primary">
          <Plus className="w-4 h-4 mr-1.5" /> Add New Level
        </Button>
      </div>

      <Card className="bg-card/50 border-border/50 shadow-sm">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="text-lg font-serif font-bold text-primary">Curriculum Hierarchy</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Click on any item to rename it inline, or use the action buttons to add, move, or delete tiers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {content.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground italic">
              No levels created yet. Click "Add New Level" to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {content.map((level) => {
                const isLevelCollapsed = collapsedNodes[level.id];
                const isEditing = editingId === level.id;

                return (
                  <div key={level.id} className="border border-primary/10 rounded-xl overflow-hidden bg-primary/5">
                    {/* Level Row */}
                    <div className="flex items-center justify-between p-4 bg-primary/10 border-b border-primary/10">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button 
                          onClick={() => toggleCollapse(level.id)}
                          className="text-primary hover:bg-primary/10 p-1 rounded transition-colors"
                        >
                          {isLevelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <Layers className="w-5 h-5 text-primary flex-shrink-0" />
                        
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 max-w-md">
                            <Input 
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="h-8 text-sm bg-background"
                              autoFocus
                            />
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-green-600 hover:bg-green-50"
                              onClick={() => handleRenameLevel(level.id)}
                              disabled={isActionPending === level.id}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className="font-serif font-bold text-primary text-base truncate cursor-pointer hover:underline"
                            onClick={() => startEditing(level.id, level.title)}
                          >
                            {level.title}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-xs text-primary hover:bg-primary/10"
                          onClick={() => handleCreateModule(level.id)}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Module
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteLevel(level.id)}
                          disabled={isActionPending === level.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Modules Container */}
                    {!isLevelCollapsed && (
                      <div className="p-4 space-y-4 bg-background/40">
                        {level.modules.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic pl-8">No modules in this level yet.</p>
                        ) : (
                          level.modules.map((module: any) => {
                            const isModuleCollapsed = collapsedNodes[module.id];
                            const isModuleEditing = editingId === module.id;

                            return (
                              <div key={module.id} className="border border-border/60 rounded-lg overflow-hidden bg-card/50 ml-4">
                                {/* Module Row */}
                                <div className="flex items-center justify-between p-3 bg-secondary/30 border-b border-border/50">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button 
                                      onClick={() => toggleCollapse(module.id)}
                                      className="text-muted-foreground hover:bg-secondary p-1 rounded transition-colors"
                                    >
                                      {isModuleCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    <Folder className="w-4 h-4 text-amber-600 flex-shrink-0" />

                                    <button
                                      onClick={(e) => handleToggleModulePublication(e, module.id)}
                                      className={`shrink-0 p-0.5 rounded transition-colors ${
                                        module.isPublished
                                          ? "text-green-500 hover:text-green-600"
                                          : "text-muted-foreground/40 hover:text-muted-foreground"
                                      }`}
                                      title={module.isPublished ? "Click to hide" : "Click to publish"}
                                    >
                                      {module.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>

                                    {isModuleEditing ? (
                                      <div className="flex items-center gap-2 flex-1 max-w-md">
                                        <Input 
                                          value={editingText}
                                          onChange={(e) => setEditingText(e.target.value)}
                                          className="h-8 text-sm bg-background"
                                          autoFocus
                                        />
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          className="h-8 w-8 text-green-600 hover:bg-green-50"
                                          onClick={() => handleRenameModule(module.id)}
                                          disabled={isActionPending === module.id}
                                        >
                                          <Check className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                                          onClick={() => setEditingId(null)}
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <span 
                                        className="font-medium text-foreground text-sm truncate cursor-pointer hover:underline"
                                        onClick={() => startEditing(module.id, module.title)}
                                        >
                                          {formatModuleTitle(module)}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {/* Move Module Select */}
                                    <div className="flex items-center gap-1.5">
                                      <Move className="w-3.5 h-3.5 text-muted-foreground" />
                                      <Select
                                        value={module.levelId || "unassigned"}
                                        onValueChange={(val) => handleMoveModule(module.id, val === "unassigned" ? null : val)}
                                      >
                                        <SelectTrigger className="w-36 h-7 text-[11px] bg-background">
                                          <SelectValue placeholder="Move Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="unassigned">Unassigned</SelectItem>
                                          {levels.map((lvl) => (
                                            <SelectItem key={lvl.id} value={lvl.id}>
                                              {lvl.title}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 text-xs text-muted-foreground hover:text-primary"
                                      onClick={() => handleCreateLesson(module.id)}
                                    >
                                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Lesson
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteModule(module.id)}
                                      disabled={isActionPending === module.id}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Lessons Container */}
                                {!isModuleCollapsed && (
                                  <div className="p-3 space-y-2 bg-background/20">
                                    {module.lessons.length === 0 ? (
                                      <p className="text-xs text-muted-foreground italic pl-8">No lessons in this module yet.</p>
                                    ) : (
                                      module.lessons.map((lesson: any) => {
                                        const isLessonEditing = editingId === lesson.id;

                                        return (
                                          <div key={lesson.id} className="flex items-center justify-between p-2 hover:bg-secondary/30 rounded-lg transition-colors ml-8">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                              
                                              {isLessonEditing ? (
                                                <div className="flex items-center gap-2 flex-1 max-w-md">
                                                  <Input 
                                                    value={editingText}
                                                    onChange={(e) => setEditingText(e.target.value)}
                                                    className="h-8 text-sm bg-background"
                                                    autoFocus
                                                  />
                                                  <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 text-green-600 hover:bg-green-50"
                                                    onClick={() => handleRenameLesson(lesson)}
                                                    disabled={isActionPending === lesson.id}
                                                  >
                                                    <Check className="w-4 h-4" />
                                                  </Button>
                                                  <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                                                    onClick={() => setEditingId(null)}
                                                  >
                                                    <X className="w-4 h-4" />
                                                  </Button>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-2 min-w-0">
                                                  <span 
                                                    className="text-sm text-foreground truncate cursor-pointer hover:underline"
                                                    onClick={() => startEditing(lesson.id, lesson.title)}
                                                  >
                                                    {lesson.title}
                                                  </span>
                                                  {lesson.isPublished ? (
                                                    <Badge className="h-4 text-[9px] bg-green-500/10 text-green-700 border-green-500/20">Live</Badge>
                                                  ) : (
                                                    <Badge variant="secondary" className="h-4 text-[9px] bg-amber-500/10 text-amber-700 border-amber-500/20">Draft</Badge>
                                                  )}
                                                </div>
                                              )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                              <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                disabled={isActionPending === lesson.id}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
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
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}