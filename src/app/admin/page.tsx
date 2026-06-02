"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCourseContent, updateLesson, createModule, createLevel, createLesson, getLevelsOnly, updateModuleLevel, deleteLesson } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Plus, Save, Loader2, Eye, EyeOff, BookOpen, BrainCircuit, Video, 
  Calendar, Film, Layers, Trash2, Search, Filter, ChevronDown, ChevronUp, 
  Maximize2, Minimize2, Sparkles, CheckCircle2, AlertCircle, BarChart3,
  StickyNote, Play, Pause, RotateCcw, Timer, Zap
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import AdminNav from "@/components/AdminNav";
import { authClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ADMIN_EMAILS = ["admin@accompanist.com", "daniele.buatti@gmail.com"];

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  scheduled: "Scheduled",
  filmed: "Filmed",
  edited: "Edited",
  uploaded: "Uploaded",
};

const STATUS_COLORS: Record<string, string> = {
  not_started: "bg-red-500/10 text-red-700 border-red-500/20",
  scheduled: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  filmed: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  edited: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  uploaded: "bg-green-500/10 text-green-700 border-green-500/20",
};

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [content, setContent] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // ADHD-friendly UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, published, draft
  const [videoFilter, setVideoFilter] = useState("all"); // all, requires_video, no_video
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [zenLesson, setZenLesson] = useState<any | null>(null);

  // ADHD Scratchpad State
  const [scratchpad, setScratchpad] = useState("");

  // Pomodoro Timer States
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/auth/sign-in");
      return;
    }
    if (session && (!session.user.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase()))) {
      router.push("/portal");
      return;
    }
    fetchData();
    
    // Load Scratchpad from localStorage
    const savedScratchpad = localStorage.getItem("adhd_scratchpad");
    if (savedScratchpad) {
      setScratchpad(savedScratchpad);
    }
  }, [session, isAuthPending, router]);

  // Pomodoro Timer Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            // Switch modes
            if (timerMode === "focus") {
              showSuccess("Focus session complete! Take a well-deserved 5-minute break.");
              setTimerMode("break");
              return 5 * 60;
            } else {
              showSuccess("Break over! Ready to crush another focus session?");
              setTimerMode("focus");
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleScratchpadChange = (val: string) => {
    setScratchpad(val);
    localStorage.setItem("adhd_scratchpad", val);
  };

  const fetchData = async () => {
    try {
      const [courseData, levelsData] = await Promise.all([
        getCourseContent(true),
        getLevelsOnly()
      ]);
      setContent(courseData);
      setLevels(levelsData);
    } catch (error) {
      showError("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate Stats for ADHD Gamification
  const getStats = () => {
    let totalLessons = 0;
    let publishedLessons = 0;
    let draftLessons = 0;
    let totalVideos = 0;
    let uploadedVideos = 0;
    const draftLessonsList: any[] = [];

    content.forEach(level => {
      level.modules.forEach((module: any) => {
        module.lessons.forEach((lesson: any) => {
          totalLessons++;
          if (lesson.isPublished) publishedLessons++;
          else {
            draftLessons++;
            draftLessonsList.push({ ...lesson, moduleTitle: module.title });
          }

          if (lesson.hasVideo) {
            totalVideos++;
            if (lesson.videoStatus === "uploaded") uploadedVideos++;
          }
        });
      });
    });

    const courseProgress = totalLessons > 0 ? Math.round((publishedLessons / totalLessons) * 100) : 0;
    const videoProgress = totalVideos > 0 ? Math.round((uploadedVideos / totalVideos) * 100) : 0;

    // Pick a random draft lesson as the "Next Recommended Action" to prevent decision paralysis
    const nextAction = draftLessonsList.length > 0 
      ? draftLessonsList[Math.floor((new Date().getDate() * 7) % draftLessonsList.length)]
      : null;

    return { totalLessons, publishedLessons, draftLessons, totalVideos, uploadedVideos, courseProgress, videoProgress, nextAction };
  };

  const stats = getStats();

  const handleUpdateLesson = async (lessonId: string, lessonData: any) => {
    setIsSaving(lessonId);
    try {
      await updateLesson(lessonId, {
        title: lessonData.title,
        videoUrl: lessonData.videoUrl,
        notes: lessonData.notes || "",
        adminNotes: lessonData.adminNotes || "",
        isPublished: lessonData.isPublished ?? false,
        duration: lessonData.duration || "00:00",
        hasVideo: lessonData.hasVideo ?? true,
        videoStatus: lessonData.videoStatus ?? 'not_started',
        filmingDate: lessonData.filmingDate ? new Date(lessonData.filmingDate) : null,
      });
      showSuccess("Lesson updated successfully!");
      if (zenLesson && zenLesson.id === lessonId) {
        setZenLesson(lessonData);
      }
    } catch (error) {
      showError("Failed to update lesson");
    } finally {
      setIsSaving(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson draft? This action cannot be undone.")) return;
    
    setIsDeleting(lessonId);
    try {
      await deleteLesson(lessonId);
      showSuccess("Lesson draft deleted successfully");
      if (zenLesson && zenLesson.id === lessonId) {
        setZenLesson(null);
      }
      fetchData();
    } catch (error) {
      showError("Failed to delete lesson");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleAddLevel = async () => {
    const title = prompt("Enter level title (e.g., Level 4: Advanced Techniques):");
    if (!title) return;
    try {
      await createLevel(title);
      fetchData();
      showSuccess("Level created");
    } catch (error) {
      showError("Failed to create level");
    }
  };

  const handleAddModule = async (levelId: string) => {
    const title = prompt("Enter module title:");
    if (!title) return;
    try {
      await createModule(title, levelId);
      fetchData();
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
        isPublished: false,
        hasVideo: true,
        videoStatus: 'not_started',
        filmingDate: null,
      });
      fetchData();
      showSuccess("Lesson draft added");
    } catch (error) {
      showError("Failed to add lesson");
    }
  };

  const handleMoveModule = async (moduleId: string, levelId: string) => {
    try {
      await updateModuleLevel(moduleId, levelId);
      fetchData();
      showSuccess("Module moved successfully");
    } catch (error) {
      showError("Failed to move module");
    }
  };

  const toggleLevelCollapse = (levelId: string) => {
    setCollapsedLevels(prev => ({ ...prev, [levelId]: !prev[levelId] }));
  };

  const toggleModuleCollapse = (moduleId: string) => {
    setCollapsedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (isLoading || isAuthPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 max-w-5xl mx-auto relative">
      <AdminNav />

      {/* ADHD Gamified Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card/40 border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Completion</p>
              <h3 className="text-2xl font-serif font-bold text-primary">{stats.courseProgress}%</h3>
              <Progress value={stats.courseProgress} className="h-1.5 w-32 bg-primary/10" />
            </div>
            <div className="p-3 rounded-xl bg-primary/5 text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Video Production</p>
              <h3 className="text-2xl font-serif font-bold text-accent">{stats.videoProgress}%</h3>
              <Progress value={stats.videoProgress} className="h-1.5 w-32 bg-accent/10" />
            </div>
            <div className="p-3 rounded-xl bg-accent/5 text-accent">
              <Film className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Drafts vs Published</p>
              <h3 className="text-2xl font-serif font-bold text-foreground">
                {stats.draftLessons} <span className="text-sm font-sans font-normal text-muted-foreground">drafts</span> / {stats.publishedLessons} <span className="text-sm font-sans font-normal text-muted-foreground">live</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">Total of {stats.totalLessons} lessons</p>
            </div>
            <div className="p-3 rounded-xl bg-muted text-muted-foreground">
              <BarChart3 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ADHD Brain Dump & Next Action Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Brain Dump Scratchpad */}
        <Card className="md:col-span-2 bg-amber-500/5 border-amber-500/20 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-amber-600" />
                ADHD Brain Dump Scratchpad
              </CardTitle>
              <CardDescription className="text-xs text-amber-700/70">
                Fleeting ideas? Random thoughts? Dump them here instantly. Auto-saves to your browser.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={scratchpad}
              onChange={(e) => handleScratchpadChange(e.target.value)}
              placeholder="Type anything here... 'Remember to add a PDF download for Module 3' or 'Film Module 5 on Friday'..."
              className="bg-background/80 border-amber-500/20 text-sm h-24 resize-none focus-visible:ring-amber-500"
            />
          </CardContent>
        </Card>

        {/* Bite-Sized Next Action Recommender */}
        <Card className="bg-primary/5 border-primary/20 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent fill-accent" />
              Bite-Sized Next Action
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Overcome task paralysis. Just do this one small thing next:
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-4">
            {stats.nextAction ? (
              <div className="space-y-1 bg-background/60 p-3 rounded-xl border border-primary/10">
                <p className="text-xs font-bold text-primary truncate">{stats.nextAction.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{stats.nextAction.moduleTitle}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">All lessons are published! You are a superstar! 🌟</p>
            )}
            {stats.nextAction && (
              <Button 
                size="sm" 
                className="w-full bg-primary hover:bg-primary/90 text-xs h-8"
                onClick={() => setZenLesson(stats.nextAction)}
              >
                <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Focus on This Lesson
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ADHD Search & Filter Bar */}
      <div className="bg-card/30 border border-border/50 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Quick search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/80 h-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9 text-xs bg-background/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>

          <Select value={videoFilter} onValueChange={setVideoFilter}>
            <SelectTrigger className="w-36 h-9 text-xs bg-background/50">
              <SelectValue placeholder="Video Requirement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lessons</SelectItem>
              <SelectItem value="requires_video">Requires Video</SelectItem>
              <SelectItem value="no_video">No Video</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleAddLevel} className="bg-primary h-9 text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Add Level
          </Button>
        </div>
      </div>

      {/* Curriculum List */}
      <div className="space-y-8">
        {content.map((level) => {
          const isLevelCollapsed = collapsedLevels[level.id];
          return (
            <div key={level.id} className="space-y-4 bg-primary/5 p-6 rounded-2xl border border-primary/10 transition-all">
              {/* Tier 1: Level Header */}
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <button 
                  onClick={() => toggleLevelCollapse(level.id)}
                  className="flex items-center gap-2 hover:opacity-80 transition-all text-left"
                >
                  {isLevelCollapsed ? <ChevronDown className="w-5 h-5 text-primary" /> : <ChevronUp className="w-5 h-5 text-primary" />}
                  <Layers className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-serif font-bold text-primary">{level.title}</h3>
                </button>
                <Button variant="outline" size="sm" onClick={() => handleAddModule(level.id)} className="h-8 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Module
                </Button>
              </div>

              {!isLevelCollapsed && (
                <div className="space-y-8 pl-4">
                  {level.modules.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No modules in this level yet.</p>
                  ) : (
                    level.modules.map((module: any) => {
                      const isModuleCollapsed = collapsedModules[module.id];
                      return (
                        <div key={module.id} className="space-y-4">
                          {/* Tier 2: Module Header */}
                          <div className="flex items-center justify-between border-b border-border pb-2">
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => toggleModuleCollapse(module.id)}
                                className="flex items-center gap-2 hover:opacity-80 transition-all text-left"
                              >
                                {isModuleCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                                <h4 className="text-lg font-serif font-medium text-foreground">{module.title}</h4>
                              </button>
                              <Select
                                value={module.levelId || ""}
                                onValueChange={(val) => handleMoveModule(module.id, val)}
                              >
                                <SelectTrigger className="w-40 h-7 text-[11px] bg-background">
                                  <SelectValue placeholder="Move to Level" />
                                </SelectTrigger>
                                <SelectContent>
                                  {levels.map((lvl) => (
                                    <SelectItem key={lvl.id} value={lvl.id}>
                                      {lvl.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleAddLesson(module.id)} className="h-8 text-xs">
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add Lesson Draft
                            </Button>
                          </div>

                          {/* Tier 3: Lessons */}
                          {!isModuleCollapsed && (
                            <div className="grid gap-6">
                              {module.lessons
                                .filter((lesson: any) => {
                                  const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
                                  const matchesStatus = statusFilter === "all" || 
                                    (statusFilter === "published" && lesson.isPublished) || 
                                    (statusFilter === "draft" && !lesson.isPublished);
                                  const matchesVideo = videoFilter === "all" || 
                                    (videoFilter === "requires_video" && lesson.hasVideo) || 
                                    (videoFilter === "no_video" && !lesson.hasVideo);
                                  return matchesSearch && matchesStatus && matchesVideo;
                                })
                                .map((lesson: any) => (
                                  <Card key={lesson.id} className="bg-card/50 border-border/60 shadow-sm hover:shadow-md transition-all">
                                    <CardHeader className="pb-2">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-wrap">
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
                                          {lesson.hasVideo && (
                                            <Badge variant="outline" className={`flex items-center gap-1 ${STATUS_COLORS[lesson.videoStatus] || ""}`}>
                                              <Film className="w-3 h-3" /> {STATUS_LABELS[lesson.videoStatus] || "Not Started"}
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
                                                const lvlIdx = newContent.findIndex(l => l.id === level.id);
                                                const modIdx = newContent[lvlIdx].modules.findIndex((m: any) => m.id === module.id);
                                                const lesIdx = newContent[lvlIdx].modules[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                                                newContent[lvlIdx].modules[modIdx].lessons[lesIdx].isPublished = checked;
                                                setContent(newContent);
                                              }}
                                            />
                                            <Label htmlFor={`publish-${lesson.id}`} className="text-xs font-medium cursor-pointer">
                                              {lesson.isPublished ? "Published" : "Draft"}
                                            </Label>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              className="h-8 text-xs border-border/80 hover:bg-primary/5 hover:text-primary"
                                              onClick={() => setZenLesson(lesson)}
                                            >
                                              <Maximize2 className="w-3.5 h-3.5 mr-1" /> Focus
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              onClick={() => handleUpdateLesson(lesson.id, lesson)}
                                              disabled={isSaving === lesson.id || isDeleting === lesson.id}
                                              className="h-8 text-xs"
                                            >
                                              {isSaving === lesson.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                                              Save
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="ghost"
                                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                              onClick={() => handleDeleteLesson(lesson.id)}
                                              disabled={isSaving === lesson.id || isDeleting === lesson.id}
                                            >
                                              {isDeleting === lesson.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </Button>
                                          </div>
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
                                              const lvlIdx = newContent.findIndex(l => l.id === level.id);
                                              const modIdx = newContent[lvlIdx].modules.findIndex((m: any) => m.id === module.id);
                                              const lesIdx = newContent[lvlIdx].modules[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                                              newContent[lvlIdx].modules[modIdx].lessons[lesIdx].title = e.target.value;
                                              setContent(newContent);
                                            }}
                                            className="h-9 text-sm"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-xs font-semibold text-muted-foreground">Duration (e.g., 08:45)</label>
                                          <Input 
                                            value={lesson.duration} 
                                            onChange={(e) => {
                                              const newContent = [...content];
                                              const lvlIdx = newContent.findIndex(l => l.id === level.id);
                                              const modIdx = newContent[lvlIdx].modules.findIndex((m: any) => m.id === module.id);
                                              const lesIdx = newContent[lvlIdx].modules[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                                              newContent[lvlIdx].modules[modIdx].lessons[lesIdx].duration = e.target.value;
                                              setContent(newContent);
                                            }}
                                            className="h-9 text-sm"
                                          />
                                        </div>
                                      </div>

                                      {/* Video Tracking Section */}
                                      <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 space-y-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <Video className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-primary">Video Production Tracking</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id={`has-video-${lesson.id}`}
                                              checked={lesson.hasVideo}
                                              onCheckedChange={(checked) => {
                                                const newContent = [...content];
                                                const lvlIdx = newContent.findIndex(l => l.id === level.id);
                                                const modIdx = newContent[lvlIdx].modules.findIndex((m: any) => m.id === module.id);
                                                const lesIdx = newContent[lvlIdx].modules[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                                                newContent[lvlIdx].modules[modIdx].lessons[lesIdx].hasVideo = checked;
                                                setContent(newContent);
                                              }}
                                            />
                                            <Label htmlFor={`has-video-${lesson.id}`} className="text-xs font-medium cursor-pointer">
                                              Requires Video
                                            </Label>
                                          </div>
                                        </div>

                                        {lesson.hasVideo && (
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                            <div className="space-y-1">
                                              <label className="text-xs font-semibold text-muted-foreground">Video Status</label>
                                              <Select
                                                value={lesson.videoStatus}
                                                onValueChange={(val) => {
                                                  const newContent = [...content];
                                                  const lvlIdx = newContent.findIndex(l => l.id === level.id);
                                                  const modIdx = newContent[lvlIdx].modules.findIndex((m: any) => m.id === module.id);
                                                  const lesIdx = newContent[lvlIdx].modules[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                                                  newContent[lvlIdx].modules[modIdx].lessons[lesIdx].videoStatus = val;
                                                  setContent(newContent);
                                                }}
                                              >
                                                <SelectTrigger className="h-9 text-xs bg-background">
                                                  <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="not_started">Not Started</SelectItem>
                                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                                  <SelectItem value="filmed">Filmed</SelectItem>
                                                  <SelectItem value="edited">Edited</SelectItem>
                                                  <SelectItem value="uploaded">Uploaded</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>

                                            <div className="space-y-1">
                                              <label className="text-xs font-semibold text-muted-foreground">Filming Date</label>
                                              <div className="relative">
                                                <Input
                                                  type="date"
                                                  className="h-9 text-xs bg-background pl-8"
                                                  value={lesson.filmingDate ? new Date(lesson.filmingDate).toISOString().split('T')[0] : ""}
                                                  onChange={(e) => {
                                                    const newContent = [...content];
                                                    const lvlIdx = newContent.findIndex(l => l.id === level.id);
                                                    const modIdx = newContent[lvlIdx].modules.findIndex((m: any) => m.id === module.id);
                                                    const lesIdx = newContent[lvlIdx].modules[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                                                    newContent[lvlIdx].modules[modIdx].lessons[lesIdx].filmingDate = e.target.value ? new Date(e.target.value) : null;
                                                    setContent(newContent);
                                                  }}
                                                />
                                                <Calendar className="w-4 h-4 text-muted-foreground absolute left-2.5 top-2.5" />
                                              </div>
                                            </div>

                                            <div className="space-y-1">
                                              <label className="text-xs font-semibold text-muted-foreground">Video URL (YouTube)</label>
                                              <Input 
                                                value={lesson.videoUrl} 
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                className="h-9 text-xs bg-background"
                                                onChange={(e) => {
                                                  const newContent = [...content];
                                                  const lvlIdx = newContent.findIndex(l => l.id === level.id);
                                                  const modIdx = newContent[lvlIdx].modules.findIndex((m: any) => m.id === module.id);
                                                  const lesIdx = newContent[lvlIdx].modules[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                                                  newContent[lvlIdx].modules[modIdx].lessons[lesIdx].videoUrl = e.target.value;
                                                  setContent(newContent);
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}
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
                                              const lvlIdx = newContent.findIndex(l => l.id === level.id);
                                              const modIdx = newContent[lvlIdx].modules.findIndex((m: any) => m.id === module.id);
                                              const lesIdx = newContent[lvlIdx].modules[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                                              newContent[lvlIdx].modules[modIdx].lessons[lesIdx].notes = e.target.value;
                                              setContent(newContent);
                                            }}
                                            className="bg-background border-border/80 text-sm"
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
                                              const lvlIdx = newContent.findIndex(l => l.id === level.id);
                                              const modIdx = newContent[lvlIdx].modules.findIndex((m: any) => m.id === module.id);
                                              const lesIdx = newContent[lvlIdx].modules[modIdx].lessons.findIndex((l: any) => l.id === lesson.id);
                                              newContent[lvlIdx].modules[modIdx].lessons[lesIdx].adminNotes = e.target.value;
                                              setContent(newContent);
                                            }}
                                            className="bg-background border-border/80 text-sm"
                                          />
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              }
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

      {/* ADHD Zen Focus Mode Overlay */}
      {zenLesson && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col p-6 md:p-12 overflow-y-auto animate-in fade-in duration-200">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent fill-accent" /> Zen Focus Mode
                  </Badge>
                  {zenLesson.isPublished ? (
                    <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Published</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-500/20">Draft</Badge>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-1">
                  {zenLesson.title || "Untitled Lesson"}
                </h2>
              </div>
              
              {/* ADHD Zen Pomodoro Timer Widget */}
              <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 px-4 py-2.5 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-primary">
                  <Timer className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {timerMode === "focus" ? "Focus Session" : "Break Time"}
                  </span>
                </div>
                <div className="font-mono text-lg font-bold text-primary">
                  {formatTime(pomodoroTime)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-primary hover:bg-primary/10"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-primary hover:bg-primary/10"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setPomodoroTime(timerMode === "focus" ? 25 * 60 : 5 * 60);
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setZenLesson(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Minimize2 className="w-5 h-5 mr-2" /> Exit Focus
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              {/* Client-Facing Notes */}
              <div className="flex flex-col space-y-3 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Client-Facing Notes</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Visible to students</span>
                </div>
                <Textarea 
                  className="flex-1 bg-background border-border/80 text-base p-4 leading-relaxed resize-none min-h-[350px]"
                  placeholder="Write notes, summaries, or instructions for your students..."
                  value={zenLesson.notes || ""} 
                  onChange={(e) => {
                    const updated = { ...zenLesson, notes: e.target.value };
                    setZenLesson(updated);
                    // Sync back to main content state
                    const newContent = [...content];
                    content.forEach((level, lvlIdx) => {
                      level.modules.forEach((module: any, modIdx: number) => {
                        const lesIdx = module.lessons.findIndex((l: any) => l.id === zenLesson.id);
                        if (lesIdx !== -1) {
                          newContent[lvlIdx].modules[modIdx].lessons[lesIdx].notes = e.target.value;
                        }
                      });
                    });
                    setContent(newContent);
                  }}
                />
              </div>

              {/* Back-End / Draft Notes */}
              <div className="flex flex-col space-y-3 bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700">
                    <BrainCircuit className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Back-End / Draft Notes</span>
                  </div>
                  <span className="text-xs text-amber-600">Private brain dump</span>
                </div>
                <Textarea 
                  className="flex-1 bg-background border-border/80 text-base p-4 leading-relaxed resize-none min-h-[350px]"
                  placeholder="Brain dump your ideas, curriculum outlines, or raw thoughts here..."
                  value={zenLesson.adminNotes || ""} 
                  onChange={(e) => {
                    const updated = { ...zenLesson, adminNotes: e.target.value };
                    setZenLesson(updated);
                    // Sync back to main content state
                    const newContent = [...content];
                    content.forEach((level, lvlIdx) => {
                      level.modules.forEach((module: any, modIdx: number) => {
                        const lesIdx = module.lessons.findIndex((l: any) => l.id === zenLesson.id);
                        if (lesIdx !== -1) {
                          newContent[lvlIdx].modules[modIdx].lessons[lesIdx].adminNotes = e.target.value;
                        }
                      });
                    });
                    setContent(newContent);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="zen-publish"
                  checked={zenLesson.isPublished}
                  onCheckedChange={(checked) => {
                    const updated = { ...zenLesson, isPublished: checked };
                    setZenLesson(updated);
                    // Sync back to main content state
                    const newContent = [...content];
                    content.forEach((level, lvlIdx) => {
                      level.modules.forEach((module: any, modIdx: number) => {
                        const lesIdx = module.lessons.findIndex((l: any) => l.id === zenLesson.id);
                        if (lesIdx !== -1) {
                          newContent[lvlIdx].modules[modIdx].lessons[lesIdx].isPublished = checked;
                        }
                      });
                    });
                    setContent(newContent);
                  }}
                />
                <Label htmlFor="zen-publish" className="text-sm font-medium cursor-pointer">
                  {zenLesson.isPublished ? "Published" : "Draft"}
                </Label>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setZenLesson(null)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => handleUpdateLesson(zenLesson.id, zenLesson)}
                  disabled={isSaving === zenLesson.id}
                  className="px-6"
                >
                  {isSaving === zenLesson.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}