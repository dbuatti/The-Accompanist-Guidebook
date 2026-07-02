"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCourseContent, updateLesson, createModule, createLevel, createLesson, getLevelsOnly, updateModuleLevel, deleteLesson, generateLessonNotes, syncUpdatedContent, scaffoldAuditionGuidebook } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { 
  Layers, ChevronDown, ChevronUp, Plus, Loader2
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import AdminNav from "@/components/AdminNav";
import { authClient } from "@/lib/auth/client";

// Import Modular Components using relative paths
import DopamineCelebration from "../../components/admin/DopamineCelebration";
import StatsDashboard from "../../components/admin/StatsDashboard";
import BrainDumpScratchpad from "../../components/admin/BrainDumpScratchpad";
import SearchFilterBar from "../../components/admin/SearchFilterBar";
import AddLessonModal from "../../components/admin/AddLessonModal";
import ZenFocusMode from "../../components/admin/ZenFocusMode";
import LessonCard from "../../components/admin/LessonCard";

// Icons & Colors Mapping
import { Battery, BatteryCharging, BatteryLow } from "lucide-react";

const ADMIN_EMAILS = ["daniele.buatti@gmail.com"];

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

const ENERGY_COLORS: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  medium: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

const ENERGY_ICONS: Record<string, any> = {
  low: BatteryLow,
  medium: Battery,
  high: BatteryCharging,
};

// ADHD Writing Templates to overcome blank-page anxiety
const WRITING_TEMPLATES = {
  none: {
    title: "Blank Slate",
    notes: "",
    adminNotes: ""
  },
  standard: {
    title: "Standard Lesson Template",
    notes: `### Lesson Overview\n[Provide a 2-sentence summary of what this lesson covers.]\n\n### Key Concepts\n1. **Concept One**: [Brief explanation]\n2. **Concept Two**: [Brief explanation]\n\n### Daniele's Pro-Tip\n> [Insert a golden nugget of real-world advice here!]\n\n### Action Steps\n- [ ] [Action step 1]\n- [ ] [Action step 2]`,
    adminNotes: `### Video Outline\n- Intro (0:00 - 1:00)\n- Main Concept (1:00 - 3:30)\n- Demonstration (3:30 - 5:00)\n- Outro & Next Steps (5:00 - 6:00)\n\n### Props/Materials Needed\n- [e.g., Sheet music binder, iPad]`
  },
  story: {
    title: "Story-Driven Lesson Template",
    notes: `### The Story\n[Tell a captivating story from an audition room or performance that illustrates the lesson's core point.]\n\n### The Moral of the Story\n[Explain the musical or professional lesson learned from this experience.]\n\n### Daniele's Pro-Tip\n> [Insert a golden nugget of real-world advice here!]\n\n### How to Apply This\n- [ ] [Practical application 1]\n- [ ] [Practical application 2]`,
    adminNotes: `### Story Outline\n- Who was involved?\n- What went wrong/right?\n- What was the turning point?\n\n### Key Takeaways to Emphasize\n- [e.g., Always keep page one visible]`
  },
  exercise: {
    title: "Exercise & Practice Template",
    notes: `### The Goal\n[What skill or technique will the student master by doing this exercise?]\n\n### Step-by-Step Exercise\n1. **Step 1**: [Instructions]\n2. **Step 2**: [Instructions]\n3. **Step 3**: [Instructions]\n\n### Daniele's Pro-Tip\n> [Insert a golden nugget of real-world advice here!]\n\n### Practice Schedule\n- [ ] Practice this [X] times a day for [Y] days.`,
    adminNotes: `### Demonstration Plan\n- Show the incorrect way first (common mistake)\n- Show the correct way\n- Break down the physical/vocal adjustments`
  }
};

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [content, setContent] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScaffolding, setIsScaffolding] = useState(false);

  // ADHD-friendly UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [videoFilter, setVideoFilter] = useState("all");
  const [energyFilter, setEnergyFilter] = useState("all");
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [zenLesson, setZenLesson] = useState<any | null>(null);

  // Add Lesson Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState("05:00");
  const [newLessonEnergy, setNewLessonEnergy] = useState("medium");
  const [newLessonHasVideo, setNewLessonHasVideo] = useState(true);
  const [newLessonTemplate, setNewLessonTemplate] = useState<"none" | "standard" | "story" | "exercise">("none");
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  // ADHD Scratchpad State
  const [scratchpad, setScratchpad] = useState("");

  // Pomodoro Timer States
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dopamine Celebration State
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");

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
            if (timerMode === "focus") {
              triggerCelebration("Focus session complete! You are amazing! 🌟");
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

  const handleScratchpadChange = (val: string) => {
    setScratchpad(val);
    localStorage.setItem("adhd_scratchpad", val);
  };

  const triggerCelebration = (message: string) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
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
      
      if (lessonData.isPublished) {
        triggerCelebration(`🎉 Lesson "${lessonData.title}" is now LIVE!`);
      } else {
        showSuccess("Draft saved successfully!");
      }

      if (zenLesson && zenLesson.id === lessonId) {
        setZenLesson(lessonData);
      }
      fetchData();
    } catch (error) {
      showError("Failed to update lesson");
    } finally {
      setIsSaving(null);
    }
  };

  const handleGenerateWithGemini = async (lessonId: string) => {
    setIsGenerating(lessonId);
    try {
      const result = await generateLessonNotes(lessonId);
      if (result.success) {
        triggerCelebration("✨ Gemini AI has written your lesson notes beautifully!");
        await fetchData();
        
        if (zenLesson && zenLesson.id === lessonId) {
          setZenLesson({ ...zenLesson, notes: result.notes });
        }
      }
    } catch (error: any) {
      showError(error.message || "Failed to generate notes with Gemini AI");
    } finally {
      setIsGenerating(null);
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

  const handleApplyTemplate = (templateKey: "standard" | "story" | "exercise") => {
    if (!zenLesson) return;
    const template = (zenLesson.notes || "").trim() === "" ? true : confirm("This will overwrite your current notes with the template. Are you sure?");
    if (!template) return;

    const selectedTemplate = WRITING_TEMPLATES[templateKey];
    const updated = {
      ...zenLesson,
      notes: selectedTemplate.notes,
      adminNotes: selectedTemplate.adminNotes
    };
    setZenLesson(updated);

    const newContent = [...content];
    content.forEach((level, lvlIdx) => {
      level.modules.forEach((module: any, modIdx: number) => {
        const lesIdx = module.lessons.findIndex((l: any) => l.id === zenLesson.id);
        if (lesIdx !== -1) {
          newContent[lvlIdx].modules[modIdx].lessons[lesIdx].notes = selectedTemplate.notes;
          newContent[lvlIdx].modules[modIdx].lessons[lesIdx].adminNotes = selectedTemplate.adminNotes;
        }
      });
    });
    setContent(newContent);
    showSuccess("Template applied!");
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

  const openAddLessonModal = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setNewLessonTitle("");
    setNewLessonDuration("05:00");
    setNewLessonEnergy("medium");
    setNewLessonHasVideo(true);
    setNewLessonTemplate("none");
    setIsAddModalOpen(true);
  };

  const handleCreateLessonSubmit = async () => {
    if (!activeModuleId) return;
    if (!newLessonTitle.trim()) {
      showError("Please enter a lesson title.");
      return;
    }

    setIsCreatingLesson(true);
    try {
      const template = WRITING_TEMPLATES[newLessonTemplate];
      await createLesson(activeModuleId, {
        title: newLessonTitle,
        videoUrl: "",
        duration: newLessonDuration || "05:00",
        notes: template.notes,
        adminNotes: template.adminNotes,
        isPublished: false,
        hasVideo: newLessonHasVideo,
        videoStatus: 'not_started',
        filmingDate: null,
      });
      
      setIsAddModalOpen(false);
      triggerCelebration(`✨ Lesson "${newLessonTitle}" created successfully!`);
      fetchData();
    } catch (error) {
      showError("Failed to create lesson");
    } finally {
      setIsCreatingLesson(false);
    }
  };

  const handleFieldChange = (lessonId: string, field: string, value: any) => {
    const newContent = [...content];
    content.forEach((level, lvlIdx) => {
      level.modules.forEach((module: any, modIdx: number) => {
        const lesIdx = module.lessons.findIndex((l: any) => l.id === lessonId);
        if (lesIdx !== -1) {
          newContent[lvlIdx].modules[modIdx].lessons[lesIdx][field] = value;
        }
      });
    });
    setContent(newContent);
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

      {/* Dopamine Celebration Overlay */}
      <DopamineCelebration show={showCelebration} message={celebrationMessage} />

      {/* ADHD Gamified Stats Dashboard */}
      <StatsDashboard 
        courseProgress={stats.courseProgress}
        videoProgress={stats.videoProgress}
        draftLessons={stats.draftLessons}
        publishedLessons={stats.publishedLessons}
        totalLessons={stats.totalLessons}
      />

      {/* Sync Content Buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (!confirm("This will seed the entire course (13 modules, 40+ lessons). Continue?")) return;
            setIsScaffolding(true);
            try {
              await scaffoldAuditionGuidebook();
              showSuccess("Course scaffolded! You can now publish lessons from the dashboard.");
              fetchData();
            } catch {
              showError("Scaffold failed — check DB connection");
            } finally {
              setIsScaffolding(false);
            }
          }}
          disabled={isScaffolding || isSyncing}
          className="h-8 text-xs"
        >
          {isScaffolding ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
          {isScaffolding ? "Scaffolding..." : "Scaffold Course"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (!confirm("This will update lesson notes from the scaffolder definitions. Continue?")) return;
            setIsSyncing(true);
            try {
              await syncUpdatedContent();
              showSuccess("Content synced! New lessons added, existing lessons updated.");
              fetchData();
            } catch {
              showError("Sync failed");
            } finally {
              setIsSyncing(false);
            }
          }}
          disabled={isSyncing || isScaffolding}
          className="h-8 text-xs"
        >
          {isSyncing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
          {isSyncing ? "Syncing..." : "Sync Updated Content"}
        </Button>
      </div>

      {/* ADHD Brain Dump & Next Action Row */}
      <BrainDumpScratchpad 
        scratchpad={scratchpad}
        onScratchpadChange={handleScratchpadChange}
        nextAction={stats.nextAction}
        onFocusNextAction={(action) => setZenLesson(action)}
      />

      {/* ADHD Search & Filter Bar */}
      <SearchFilterBar 
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        videoFilter={videoFilter}
        onVideoFilterChange={setVideoFilter}
        energyFilter={energyFilter}
        onEnergyFilterChange={setEnergyFilter}
        onAddLevel={handleAddLevel}
      />

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
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => openAddLessonModal(module.id)} className="h-8 text-xs">
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
                                  
                                  const lessonEnergy = lesson.energyLevel || "medium";
                                  const matchesEnergy = energyFilter === "all" || energyFilter === lessonEnergy;

                                  return matchesSearch && matchesStatus && matchesVideo && matchesEnergy;
                                })
                                .map((lesson: any) => (
                                  <LessonCard 
                                    key={lesson.id}
                                    lesson={lesson}
                                    onFocus={(l) => setZenLesson(l)}
                                    onGenerateWithGemini={handleGenerateWithGemini}
                                    isGenerating={isGenerating === lesson.id}
                                    onSave={handleUpdateLesson}
                                    isSaving={isSaving === lesson.id}
                                    onDelete={handleDeleteLesson}
                                    isDeleting={isDeleting === lesson.id}
                                    onFieldChange={handleFieldChange}
                                    energyColors={ENERGY_COLORS}
                                    energyIcons={ENERGY_ICONS}
                                    statusColors={STATUS_COLORS}
                                    statusLabels={STATUS_LABELS}
                                  />
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

      {/* ADHD Add Lesson Modal */}
      <AddLessonModal 
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title={newLessonTitle}
        onTitleChange={setNewLessonTitle}
        duration={newLessonDuration}
        onDurationChange={setNewLessonDuration}
        energy={newLessonEnergy}
        onEnergyChange={setNewLessonEnergy}
        hasVideo={newLessonHasVideo}
        onHasVideoChange={setNewLessonHasVideo}
        template={newLessonTemplate}
        onTemplateChange={setNewLessonTemplate}
        onSubmit={handleCreateLessonSubmit}
        isPending={isCreatingLesson}
      />

      {/* ADHD Zen Focus Mode Overlay */}
      {zenLesson && (
        <ZenFocusMode 
          lesson={zenLesson}
          onClose={() => setZenLesson(null)}
          timerMode={timerMode}
          pomodoroTime={pomodoroTime}
          isTimerRunning={isTimerRunning}
          onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
          onResetTimer={() => {
            setIsTimerRunning(false);
            setPomodoroTime(timerMode === "focus" ? 25 * 60 : 5 * 60);
          }}
          onApplyTemplate={handleApplyTemplate}
          onGenerateWithGemini={handleGenerateWithGemini}
          isGenerating={isGenerating === zenLesson.id}
          isSaving={isSaving === zenLesson.id}
          onSave={handleUpdateLesson}
          onLessonChange={(field, value) => {
            const updated = { ...zenLesson, [field]: value };
            setZenLesson(updated);
            handleFieldChange(zenLesson.id, field, value);
          }}
        />
      )}
    </div>
  );
}