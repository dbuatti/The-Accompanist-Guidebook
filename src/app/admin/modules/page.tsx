"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getCourseContent,
  updateLesson,
  addResource,
  deleteResource,
  updateModuleWrapUpVideo,
  toggleModuleVisibility,
} from "@/app/actions";
import { formatModuleTitle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Play,
  FileText,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Layers,
  FolderOpen,
  Save,
  Eye,
  EyeOff,
  Video,
  BookOpen,
  MoreHorizontal,
  Type,
  List,
  ListOrdered,
  Lightbulb,
  Quote,
  Minus,
  Check,
  X,
  Edit3,
  PanelRightOpen,
  PanelRightClose,
  Link2,
  ExternalLink,
  StickyNote,
  ArrowLeft,
  GitFork,
  Users,
  BrainCircuit,
  Sparkles,
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { authClient } from "@/lib/auth/client";
import VideoPlayer from "@/components/VideoPlayer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ADMIN_EMAILS } from "@/lib/admin";
import { adminNavItems } from "@/components/AdminNav";

export type BlockType =
  | "heading"
  | "paragraph"
  | "bullet_list"
  | "numbered_list"
  | "callout"
  | "quote"
  | "divider";

export interface DocBlock {
  id: string;
  type: BlockType;
  content: string;
  order?: number;
}

export default function ModuleStudioPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"video" | "docs">("docs");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [docBlocksMap, setDocBlocksMap] = useState<Record<string, DocBlock[]>>({});
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [showCliffnotes, setShowCliffnotes] = useState(true);
  const [cliffnotesMap, setCliffnotesMap] = useState<Record<string, string>>({});
  const [editingCliffLesson, setEditingCliffLesson] = useState<string | null>(null);
  const [newResource, setNewResource] = useState<Record<string, { title: string; url: string; description: string }>>({});
  const [isAddingResource, setIsAddingResource] = useState<string | null>(null);
  const [editingVideoUrl, setEditingVideoUrl] = useState<string | null>(null);
  const [videoUrlValue, setVideoUrlValue] = useState("");
  const [editingWrapUpVideo, setEditingWrapUpVideo] = useState(false);
  const [wrapUpVideoValue, setWrapUpVideoValue] = useState("");

  useEffect(() => {
    if (!isAuthPending && session) {
      fetchData();
    }
  }, [session, isAuthPending]);

  const fetchData = async () => {
    try {
      const data = await getCourseContent();
      setContent(data);
      if (data.length > 0 && data[0].modules?.length > 0) {
        const firstModule = data[0].modules[0];
        setSelectedModuleId(firstModule.id);
        setExpandedLevels({ [data[0].id]: true });
        setExpandedModules({ [firstModule.id]: true });
      }
    } catch (error) {
      showError("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lessonBlocks: Record<string, DocBlock[]> = {};
    const lessonCliffnotes: Record<string, string> = {};
    for (const level of content) {
      for (const mod of level.modules || []) {
        for (const lesson of mod.lessons || []) {
          lessonBlocks[lesson.id] = parseNotesToBlocks(lesson.notes || "");
          lessonCliffnotes[lesson.id] = lesson.cliffnotes || "";
        }
      }
    }
    setDocBlocksMap(lessonBlocks);
    setCliffnotesMap(lessonCliffnotes);
  }, [content]);

  const currentModule = findModule(content, selectedModuleId);
  const currentModuleLessons = currentModule?.lessons || [];

  const handleSaveLesson = async (lessonId: string) => {
    const lesson = findLesson(content, lessonId);
    if (!lesson) return;
    setIsSaving(lessonId);
    try {
      const blocks = docBlocksMap[lessonId] || [];
      const notes = blocksToNotes(blocks);
      const cliffnotes = cliffnotesMap[lessonId] || "";
      await updateLesson(lessonId, {
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        notes,
        adminNotes: lesson.adminNotes || "",
        cliffnotes,
        isPublished: lesson.isPublished ?? false,
        duration: lesson.duration || "05:00",
        hasVideo: lesson.hasVideo ?? true,
        videoStatus: lesson.videoStatus ?? "not_started",
        filmingDate: lesson.filmingDate ? new Date(lesson.filmingDate) : null,
        energyLevel: lesson.energyLevel ?? "medium",
      });
      const newContent = content.map((level) => ({
        ...level,
        modules: level.modules.map((mod: any) => ({
          ...mod,
          lessons: mod.lessons.map((les: any) =>
            les.id === lessonId ? { ...les, notes, cliffnotes } : les
          ),
        })),
      }));
      setContent(newContent);
      showSuccess("Lesson saved!");
    } catch (error) {
      showError("Failed to save lesson");
    } finally {
      setIsSaving(null);
    }
  };

  const handleSaveVideoUrl = async (lessonId: string) => {
    const lesson = findLesson(content, lessonId);
    if (!lesson) return;
    setIsSaving(lessonId);
    try {
      await updateLesson(lessonId, {
        title: lesson.title,
        videoUrl: videoUrlValue,
        notes: lesson.notes || "",
        adminNotes: lesson.adminNotes || "",
        cliffnotes: lesson.cliffnotes || "",
        isPublished: lesson.isPublished ?? false,
        duration: lesson.duration || "05:00",
        hasVideo: true,
        videoStatus: lesson.videoStatus ?? "not_started",
        filmingDate: lesson.filmingDate ? new Date(lesson.filmingDate) : null,
        energyLevel: lesson.energyLevel ?? "medium",
      });
      const newContent = content.map((level) => ({
        ...level,
        modules: level.modules.map((mod: any) => ({
          ...mod,
          lessons: mod.lessons.map((les: any) =>
            les.id === lessonId ? { ...les, videoUrl: videoUrlValue } : les
          ),
        })),
      }));
      setContent(newContent);
      setEditingVideoUrl(null);
      showSuccess("Video URL saved!");
    } catch (error) {
      showError("Failed to save video URL");
    } finally {
      setIsSaving(null);
    }
  };

  const handleSaveWrapUpVideo = async () => {
    if (!selectedModuleId) return;
    try {
      await updateModuleWrapUpVideo(selectedModuleId, wrapUpVideoValue);
      const newContent = content.map((level) => ({
        ...level,
        modules: level.modules.map((mod: any) =>
          mod.id === selectedModuleId ? { ...mod, wrapUpVideoUrl: wrapUpVideoValue } : mod
        ),
      }));
      setContent(newContent);
      setEditingWrapUpVideo(false);
      showSuccess("Wrap-up video saved!");
    } catch (error) {
      showError("Failed to save wrap-up video");
    }
  };

  const handleAddResource = async (lessonId: string) => {
    const res = newResource[lessonId];
    if (!res || !res.title.trim() || !res.url.trim()) return;
    try {
      const result = await addResource(lessonId, res.title, res.url, res.description);
      const newContent = content.map((level) => ({
        ...level,
        modules: level.modules.map((mod: any) => ({
          ...mod,
          lessons: mod.lessons.map((les: any) =>
            les.id === lessonId ? { ...les, resources: [...(les.resources || []), result] } : les
          ),
        })),
      }));
      setContent(newContent);
      setNewResource((prev) => ({ ...prev, [lessonId]: { title: "", url: "", description: "" } }));
      setIsAddingResource(null);
      showSuccess("Resource added!");
    } catch (error) {
      showError("Failed to add resource");
    }
  };

  const handleDeleteResource = async (resourceId: string, lessonId: string) => {
    try {
      await deleteResource(resourceId);
      const newContent = content.map((level) => ({
        ...level,
        modules: level.modules.map((mod: any) => ({
          ...mod,
          lessons: mod.lessons.map((les: any) =>
            les.id === lessonId ? { ...les, resources: (les.resources || []).filter((r: any) => r.id !== resourceId) } : les
          ),
        })),
      }));
      setContent(newContent);
      showSuccess("Resource removed");
    } catch (error) {
      showError("Failed to remove resource");
    }
  };

  const handleToggleVisibility = async (e: React.MouseEvent, moduleId: string) => {
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
    } catch { showError("Failed to toggle visibility"); }
  };

  const addBlock = (lessonId: string, type: BlockType, afterId?: string) => {
    const newBlock: DocBlock = { id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, content: "" };
    setDocBlocksMap((prev) => {
      const blocks = [...(prev[lessonId] || [])];
      if (!afterId) {
        blocks.push(newBlock);
      } else {
        const idx = blocks.findIndex((b) => b.id === afterId);
        blocks.splice(idx + 1, 0, newBlock);
      }
      return { ...prev, [lessonId]: blocks };
    });
    setEditingBlockId(newBlock.id);
  };

  const updateBlock = (lessonId: string, blockId: string, content: string) => {
    setDocBlocksMap((prev) => ({
      ...prev,
      [lessonId]: (prev[lessonId] || []).map((b) => (b.id === blockId ? { ...b, content } : b)),
    }));
  };

  const updateBlockType = (lessonId: string, blockId: string, type: BlockType) => {
    setDocBlocksMap((prev) => ({
      ...prev,
      [lessonId]: (prev[lessonId] || []).map((b) => (b.id === blockId ? { ...b, type } : b)),
    }));
  };

  const deleteBlock = (lessonId: string, blockId: string) => {
    setDocBlocksMap((prev) => ({
      ...prev,
      [lessonId]: (prev[lessonId] || []).filter((b) => b.id !== blockId),
    }));
  };

  const moveBlock = (lessonId: string, blockId: string, direction: "up" | "down") => {
    setDocBlocksMap((prev) => {
      const blocks = [...(prev[lessonId] || [])];
      const idx = blocks.findIndex((b) => b.id === blockId);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === blocks.length - 1) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [blocks[idx], blocks[swapIdx]] = [blocks[swapIdx], blocks[idx]];
      return { ...prev, [lessonId]: blocks };
    });
  };

  if (isLoading || isAuthPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Compact admin nav bar */}
      <header className="h-11 border-b border-border/40 bg-card/60 flex items-center px-4 shrink-0">
        <nav className="flex items-center gap-1 overflow-x-auto">
          <Link href="/modules" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-primary hover:bg-accent/40 transition-colors whitespace-nowrap">
            <ArrowLeft className="w-3 h-3" /> Modules
          </Link>
          <div className="w-px h-4 bg-border/40 mx-1" />
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary hover:bg-accent/40"
                }`}
              >
                <item.icon className="w-3 h-3" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-72 border-r border-border/60 bg-card/30 flex flex-col shrink-0">
        <div className="p-4 border-b border-border/60">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4" /> Curriculum
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {content.map((level) => (
              <div key={level.id}>
                <button
                  onClick={() => setExpandedLevels((prev) => ({ ...prev, [level.id]: !prev[level.id] }))}
                  className="flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded-md hover:bg-accent/40 transition-colors"
                >
                  {expandedLevels[level.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  <span className="text-xs font-semibold text-primary truncate">{level.title}</span>
                </button>
                {expandedLevels[level.id] && (
                  <div className="pl-5 space-y-1 mt-1">
                    {level.modules.map((module: any) => {
                      const isActive = selectedModuleId === module.id;
                      return (
                        <div
                          key={module.id}
                          onClick={() => setSelectedModuleId(module.id)}
                          className={`flex items-center gap-1 w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                            isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent/40 text-foreground/80"
                          }`}
                        >
                          <FolderOpen className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-amber-600"}`} />
                          <span className="text-xs truncate flex-1">{formatModuleTitle(module)}</span>
                          <button
                            onClick={(e) => handleToggleVisibility(e, module.id)}
                            className={`shrink-0 p-0.5 rounded transition-colors ${
                              module.isPublished
                                ? "text-green-500/70 hover:text-green-600"
                                : "text-muted-foreground/40 hover:text-muted-foreground"
                            }`}
                            title={module.isPublished ? "Click to hide" : "Click to publish"}
                          >
                            {module.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border/60 flex items-center justify-between px-6 bg-card/20 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center bg-muted/60 rounded-lg p-0.5 border border-border/50 shrink-0">
              <button onClick={() => setActiveView("docs")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeView === "docs" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <BookOpen className="w-3.5 h-3.5" /> Documentation
              </button>
              <button onClick={() => setActiveView("video")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeView === "video" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <Video className="w-3.5 h-3.5" /> Video
              </button>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-sm font-semibold text-foreground truncate">
              {currentModule ? currentModule.title : "Select a module"}
            </h1>
          </div>
          <button onClick={() => setShowCliffnotes(!showCliffnotes)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${showCliffnotes ? "bg-accent/20 border-accent/30 text-accent-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
            <StickyNote className="w-3.5 h-3.5" />
            {showCliffnotes ? "Hide Cliffnotes" : "Show Cliffnotes"}
          </button>
        </header>

        {/* Content with optional cliffnotes panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Scrollable lesson content */}
          <div className="flex-1 overflow-y-auto">
            {!currentModule ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12">
                <BookOpen className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">Select a module from the sidebar to view its lessons.</p>
              </div>
            ) : currentModuleLessons.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12">
                <p className="text-sm">No lessons in this module yet.</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto py-10 px-8 space-y-16">
                {currentModuleLessons.map((lesson: any, lessonIndex: number) => (
                  <div key={lesson.id} id={`lesson-${lesson.id}`}>
                    {/* Lesson Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                        {lessonIndex + 1}
                      </div>
                      <h2 className="text-xl font-serif font-bold text-primary">{lesson.title}</h2>
                      {lesson.isPublished ? (
                        <Badge className="h-5 text-[10px] bg-green-500/10 text-green-700 border-green-500/20 shrink-0">
                          <Eye className="w-2.5 h-2.5 mr-1" /> Live
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="h-5 text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20 shrink-0">
                          <EyeOff className="w-2.5 h-2.5 mr-1" /> Draft
                        </Badge>
                      )}
                      <div className="ml-auto">
                        <Button size="sm" variant="ghost" onClick={() => handleSaveLesson(lesson.id)} disabled={!!isSaving} className="h-7 text-xs">
                          {isSaving === lesson.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />} Save
                        </Button>
                      </div>
                    </div>

                    {/* Video URL editor */}
                    <div className="mb-6">
                      {editingVideoUrl === lesson.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={videoUrlValue}
                            onChange={(e) => setVideoUrlValue(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button size="sm" onClick={() => handleSaveVideoUrl(lesson.id)} disabled={!!isSaving} className="h-8 shrink-0">
                            {isSaving === lesson.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />} Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingVideoUrl(null)} className="h-8 shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingVideoUrl(lesson.id); setVideoUrlValue(lesson.videoUrl || ""); }}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <Video className="w-3.5 h-3.5" />
                          {lesson.videoUrl ? (
                            <span className="truncate max-w-md group-hover:underline">{lesson.videoUrl}</span>
                          ) : (
                            <span className="italic">Click to add video URL</span>
                          )}
                          <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>

                    {/* Video or Documentation content */}
                    {activeView === "video" ? (
                      <div className="space-y-4">
                        <VideoPlayer url={lesson.videoUrl} onComplete={() => {}} initialTime={0} onProgress={() => {}} />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {(docBlocksMap[lesson.id] || []).length === 0 ? (
                          <div className="text-center py-12 space-y-3">
                            <p className="text-muted-foreground text-sm">No content blocks yet.</p>
                            <Button variant="outline" size="sm" onClick={() => addBlock(lesson.id, "paragraph")}>
                              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add first block
                            </Button>
                          </div>
                        ) : (
                          (docBlocksMap[lesson.id] || []).map((block) => (
                            <BlockEditor
                              key={block.id}
                              block={block}
                              isEditing={editingBlockId === block.id}
                              isHovered={hoveredBlockId === block.id}
                              onEdit={() => setEditingBlockId(block.id)}
                              onBlur={() => setEditingBlockId(null)}
                              onHover={(v) => setHoveredBlockId(v ? block.id : null)}
                              onChange={(c) => updateBlock(lesson.id, block.id, c)}
                              onChangeType={(t) => updateBlockType(lesson.id, block.id, t)}
                              onDelete={() => deleteBlock(lesson.id, block.id)}
                              onMoveUp={() => moveBlock(lesson.id, block.id, "up")}
                              onMoveDown={() => moveBlock(lesson.id, block.id, "down")}
                              onAddAfter={(t) => addBlock(lesson.id, t, block.id)}
                            />
                          ))
                        )}
                        <div className="mt-4">
                          <AddBlockMenu onSelect={(t) => addBlock(lesson.id, t)} />
                        </div>
                      </div>
                    )}

                    {/* Resource Links */}
                    <div className="mt-8 pt-6 border-t border-border/40">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <Link2 className="w-4 h-4 text-primary" /> Resources
                      </h3>
                      {(lesson.resources || []).length > 0 && (
                        <div className="space-y-2 mb-3">
                          {(lesson.resources || []).map((res: any) => (
                            <div key={res.id} className="flex items-center gap-3 p-3 bg-card/50 border border-border/40 rounded-lg group">
                              <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline truncate">
                                {res.title}
                              </a>
                              {res.description && <span className="text-xs text-muted-foreground truncate">- {res.description}</span>}
                              <button onClick={() => handleDeleteResource(res.id, lesson.id)} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {isAddingResource === lesson.id ? (
                        <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg space-y-2">
                          <Input placeholder="Resource title (e.g. Musicnotes)" value={newResource[lesson.id]?.title || ""} onChange={(e) => setNewResource((prev) => ({ ...prev, [lesson.id]: { ...prev[lesson.id] || { title: "", url: "", description: "" }, title: e.target.value } }))} className="h-8 text-sm" />
                          <Input placeholder="URL (https://...)" value={newResource[lesson.id]?.url || ""} onChange={(e) => setNewResource((prev) => ({ ...prev, [lesson.id]: { ...prev[lesson.id] || { title: "", url: "", description: "" }, url: e.target.value } }))} className="h-8 text-sm" />
                          <Input placeholder="Description (optional)" value={newResource[lesson.id]?.description || ""} onChange={(e) => setNewResource((prev) => ({ ...prev, [lesson.id]: { ...prev[lesson.id] || { title: "", url: "", description: "" }, description: e.target.value } }))} className="h-8 text-sm" />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAddResource(lesson.id)} className="h-7 text-xs">Add</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsAddingResource(null)} className="h-7 text-xs">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setIsAddingResource(lesson.id); setNewResource((prev) => ({ ...prev, [lesson.id]: { title: "", url: "", description: "" } })); }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Plus className="w-3.5 h-3.5" /> Add resource
                        </button>
                      )}
                    </div>

                    {/* Lesson separator */}
                    {lessonIndex < currentModuleLessons.length - 1 && (
                      <div className="mt-16 border-t-2 border-border/30" />
                    )}
                  </div>
                ))}
                
                {/* Wrap-Up Video */}
                <div className="mt-16 pt-8 border-t-2 border-border/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-serif font-bold text-primary">Wrap-Up Video</h2>
                      <p className="text-xs text-muted-foreground">Optional video shown at the end of this module for logged-out viewers.</p>
                    </div>
                  </div>
                  {editingWrapUpVideo ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={wrapUpVideoValue}
                        onChange={(e) => setWrapUpVideoValue(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or Vimeo URL"
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveWrapUpVideo} className="h-8 shrink-0">
                        <Check className="w-3.5 h-3.5 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingWrapUpVideo(false)} className="h-8 shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingWrapUpVideo(true); setWrapUpVideoValue(currentModule?.wrapUpVideoUrl || ""); }}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <Video className="w-3.5 h-3.5" />
                      {currentModule?.wrapUpVideoUrl ? (
                        <span className="truncate max-w-md group-hover:underline">{currentModule.wrapUpVideoUrl}</span>
                      ) : (
                        <span className="italic">Click to add wrap-up video URL</span>
                      )}
                      <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cliffnotes Side Panel */}
          {showCliffnotes && currentModule && (
            <aside className="w-80 border-l border-border/60 bg-accent/5 flex flex-col shrink-0 overflow-hidden">
              <div className="p-4 border-b border-border/60 bg-accent/10">
                <h3 className="text-sm font-bold text-accent-foreground flex items-center gap-2">
                  <StickyNote className="w-4 h-4" /> Cliffnotes
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">Filming prompts — quick bullets to read while recording.</p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {currentModuleLessons.map((lesson: any, i: number) => (
                    <div key={lesson.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-accent/20 text-accent-foreground text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                        <span className="text-xs font-semibold text-foreground">{lesson.title}</span>
                      </div>
                      {editingCliffLesson === lesson.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={cliffnotesMap[lesson.id] || ""}
                            onChange={(e) => setCliffnotesMap((prev) => ({ ...prev, [lesson.id]: e.target.value }))}
                            placeholder="Bullet-point filming prompts..."
                            className="min-h-[120px] text-xs bg-background"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { handleSaveLesson(lesson.id); setEditingCliffLesson(null); }} className="h-6 text-[10px]">
                              <Check className="w-3 h-3 mr-1" /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingCliffLesson(null)} className="h-6 text-[10px]">
                              <X className="w-3 h-3 mr-1" /> Close
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingCliffLesson(lesson.id)}
                          className="cursor-text min-h-[40px] p-2 rounded-md border border-transparent hover:border-accent/30 hover:bg-accent/5 transition-colors text-xs text-foreground/70 whitespace-pre-wrap"
                        >
                          {cliffnotesMap[lesson.id] || <span className="italic text-muted-foreground/50">Click to add cliffnotes...</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </aside>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}

// --- Block Editor ---
function BlockEditor({ block, isEditing, isHovered, onEdit, onBlur, onHover, onChange, onChangeType, onDelete, onMoveUp, onMoveDown, onAddAfter }: {
  block: DocBlock; isEditing: boolean; isHovered: boolean; onEdit: () => void; onBlur: () => void; onHover: (v: boolean) => void;
  onChange: (content: string) => void; onChangeType: (type: BlockType) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; onAddAfter: (type: BlockType) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  if (block.type === "divider") {
    return (
      <div className="group relative py-2 flex items-center justify-center" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
        {isHovered && <div className="absolute right-0 -top-2 z-10"><BlockActions onChangeType={onChangeType} onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onAddAfter={onAddAfter} /></div>}
        <div className="w-full border-t-2 border-border/80" />
      </div>
    );
  }

  return (
    <div className="group relative" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      {isHovered && (
        <div className="absolute -left-8 top-1 flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={onMoveUp} className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"><ChevronRight className="w-3 h-3 -rotate-90" /></button>
          <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
          <button onClick={onMoveDown} className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"><ChevronRight className="w-3 h-3 rotate-90" /></button>
        </div>
      )}
      {isHovered && <div className="absolute right-0 top-0 z-10"><BlockActions onChangeType={onChangeType} onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onAddAfter={onAddAfter} /></div>}
      <div onClick={onEdit} className="cursor-text">
        {isEditing ? (
          <Textarea ref={textareaRef} value={block.content} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && block.type !== "paragraph") { e.preventDefault(); onBlur(); onAddAfter("paragraph"); } }}
            className={`${getBlockClassName(block.type, true)} min-h-[40px] resize-none border-transparent focus:border-primary/30 focus:bg-accent/20 bg-transparent shadow-none hover:bg-accent/10 transition-colors`}
            rows={block.type === "paragraph" || block.type === "quote" || block.type === "callout" ? 3 : 1}
          />
        ) : (
          <BlockRender block={block} />
        )}
      </div>
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[2]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<code key={key++} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{match[4]}</code>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }
  return parts.length > 0 ? parts : text;
}

function BlockRender({ block }: { block: DocBlock }) {
  const cn = getBlockClassName(block.type, false);
  const empty = <span className="text-muted-foreground/40 italic">Click to edit...</span>;
  switch (block.type) {
    case "heading": return <h2 className={cn}>{block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground/40 italic">Heading</span>}</h2>;
    case "paragraph": return <p className={cn}>{block.content ? renderInlineMarkdown(block.content) : empty}</p>;
    case "bullet_list": return <ul className={cn}><li>{block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground/40 italic">Bullet point</span>}</li></ul>;
    case "numbered_list": return <div className={`${cn} flex items-start gap-2`}><span className="text-xs font-bold text-primary/40 mt-[3px] shrink-0 tabular-nums">{block.order ?? 1}.</span><span>{block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground/40 italic">Numbered item</span>}</span></div>;
    case "callout": return <div className={`${cn} bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 rounded-r-lg`}><div className="flex items-start gap-3"><Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /><span>{block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground/40 italic">Pro tip...</span>}</span></div></div>;
    case "quote": return <blockquote className={cn}>{block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground/40 italic">Quote...</span>}</blockquote>;
    default: return <p className={cn}>{block.content ? renderInlineMarkdown(block.content) : empty}</p>;
  }
}

function getBlockClassName(type: BlockType, isEditing: boolean): string {
  const base = isEditing ? "px-3 py-2 rounded-lg w-full" : "px-3 py-1.5 rounded-lg w-full";
  switch (type) {
    case "heading": return `${base} text-xl font-serif font-bold text-primary leading-tight`;
    case "paragraph": return `${base} text-sm text-foreground/90 leading-relaxed`;
    case "bullet_list": return `${base} text-sm text-foreground/90 list-disc list-inside leading-relaxed`;
    case "numbered_list": return `${base} text-sm text-foreground/90 list-decimal list-inside leading-relaxed`;
    case "callout": return `${base} text-sm text-foreground/90 leading-relaxed p-4`;
    case "quote": return `${base} text-sm text-foreground/80 italic border-l-4 border-primary/30 pl-4 py-2 leading-relaxed`;
    default: return base;
  }
}

function BlockActions({ onChangeType, onDelete, onMoveUp, onMoveDown, onAddAfter }: {
  onChangeType: (type: BlockType) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; onAddAfter: (type: BlockType) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-card border border-border/60 rounded-md shadow-sm p-0.5">
      <button onClick={onMoveUp} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground" title="Move up"><ChevronRight className="w-3 h-3 -rotate-90" /></button>
      <button onClick={onMoveDown} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground" title="Move down"><ChevronRight className="w-3 h-3 rotate-90" /></button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3 h-3" /></button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onChangeType("heading")}><Type className="w-3.5 h-3.5 mr-2" /> Heading</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("paragraph")}><FileText className="w-3.5 h-3.5 mr-2" /> Paragraph</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("bullet_list")}><List className="w-3.5 h-3.5 mr-2" /> Bullet List</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("numbered_list")}><ListOrdered className="w-3.5 h-3.5 mr-2" /> Numbered List</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("callout")}><Lightbulb className="w-3.5 h-3.5 mr-2" /> Callout</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("quote")}><Quote className="w-3.5 h-3.5 mr-2" /> Quote</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("divider")}><Minus className="w-3.5 h-3.5 mr-2" /> Divider</DropdownMenuItem>
          <Separator className="my-1" />
          <DropdownMenuItem onClick={() => onAddAfter("paragraph")}><Plus className="w-3.5 h-3.5 mr-2" /> Add below</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AddBlockMenu({ onSelect }: { onSelect: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  const items = [
    { type: "heading" as BlockType, label: "Heading", icon: <Type className="w-4 h-4" /> },
    { type: "paragraph" as BlockType, label: "Paragraph", icon: <FileText className="w-4 h-4" /> },
    { type: "bullet_list" as BlockType, label: "Bullet List", icon: <List className="w-4 h-4" /> },
    { type: "numbered_list" as BlockType, label: "Numbered List", icon: <ListOrdered className="w-4 h-4" /> },
    { type: "callout" as BlockType, label: "Callout", icon: <Lightbulb className="w-4 h-4" /> },
    { type: "quote" as BlockType, label: "Quote", icon: <Quote className="w-4 h-4" /> },
    { type: "divider" as BlockType, label: "Divider", icon: <Minus className="w-4 h-4" /> },
  ];
  return (
    <div className="relative">
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm py-2 px-3 rounded-lg hover:bg-accent/30 w-full">
          <Plus className="w-4 h-4" /> Add a block
        </button>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl shadow-lg p-2 grid grid-cols-2 gap-1">
          {items.map((item) => (
            <button key={item.type} onClick={() => { onSelect(item.type); setOpen(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 text-sm text-foreground/80 transition-colors text-left">
              {item.icon} {item.label}
            </button>
          ))}
          <button onClick={() => setOpen(false)} className="col-span-2 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent/30 text-xs text-muted-foreground transition-colors">
            <X className="w-3 h-3" /> Close
          </button>
        </div>
      )}
    </div>
  );
}

// --- Helpers ---
function findModule(content: any[], moduleId: string | null): any | null {
  if (!moduleId) return null;
  for (const level of content) {
    for (const module of level.modules || []) {
      if (module.id === moduleId) return module;
    }
  }
  return null;
}

function findLesson(content: any[], lessonId: string): any | null {
  for (const level of content) {
    for (const module of level.modules || []) {
      for (const lesson of module.lessons || []) {
        if (lesson.id === lessonId) return lesson;
      }
    }
  }
  return null;
}

function parseNotesToBlocks(notes: string): DocBlock[] {
  if (!notes.trim()) {
    return [
      { id: "block-init-heading", type: "heading", content: "Lesson Overview" },
      { id: "block-init-p1", type: "paragraph", content: "" },
    ];
  }
  const lines = notes.split("\n");
  const blocks: DocBlock[] = [];
  let counter = 0;
  let listCounter = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { listCounter = 0; continue; }
    const id = `block-parsed-${counter++}`;
    if (trimmed.startsWith("### ")) { listCounter = 0; blocks.push({ id, type: "heading", content: trimmed.replace("### ", "") }); }
    else if (trimmed.startsWith("## ")) { listCounter = 0; blocks.push({ id, type: "heading", content: trimmed.replace("## ", "") }); }
    else if (trimmed.startsWith("# ")) { listCounter = 0; blocks.push({ id, type: "heading", content: trimmed.replace("# ", "") }); }
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) { listCounter = 0; blocks.push({ id, type: "bullet_list", content: trimmed.replace(/^[-*] /, "") }); }
    else if (/^\d+\.\s/.test(trimmed)) { listCounter++; blocks.push({ id, type: "numbered_list", content: trimmed.replace(/^\d+\.\s/, ""), order: listCounter }); }
    else if (trimmed.startsWith("> [!tip] ")) { listCounter = 0; blocks.push({ id, type: "callout", content: trimmed.replace("> [!tip] ", "") }); }
    else if (trimmed.startsWith("> ")) { listCounter = 0; blocks.push({ id, type: "quote", content: trimmed.replace("> ", "") }); }
    else if (trimmed === "---") { listCounter = 0; blocks.push({ id, type: "divider", content: "" }); }
    else { listCounter = 0; blocks.push({ id, type: "paragraph", content: trimmed }); }
  }
  if (blocks.length === 0) blocks.push({ id: "block-init-p", type: "paragraph", content: notes });
  return blocks;
}

function blocksToNotes(blocks: DocBlock[]): string {
  return blocks.map((block) => {
    switch (block.type) {
      case "heading": return `### ${block.content}`;
      case "bullet_list": return `- ${block.content}`;
      case "numbered_list": return `${block.order ?? 1}. ${block.content}`;
      case "quote": return `> ${block.content}`;
      case "callout": return `> [!tip] ${block.content}`;
      case "divider": return "---";
      default: return block.content;
    }
  }).join("\n");
}