"use client";

import { useState, useEffect } from "react";
import { getCourseContent, getLearnerStats, createLesson } from "@/app/actions";
import { authClient } from "@/lib/auth/client";
import { formatModuleTitle } from "@/lib/utils";
import { Loader2, Layers, BookOpen } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

import CurriculumTree from "@/components/admin/CurriculumTree";
import ModulePanel from "@/components/admin/ModulePanel";
import LessonEditor, { WRITING_TEMPLATES } from "@/components/admin/LessonEditor";
import CurriculumToolsMenu from "@/components/admin/CurriculumToolsMenu";
import SearchFilterBar from "@/components/admin/SearchFilterBar";
import AddLessonModal from "@/components/admin/AddLessonModal";
import StatsDashboard from "@/components/admin/StatsDashboard";
import LearnerStats from "@/components/admin/LearnerStats";

type Selection = { type: "module" | "lesson"; id: string } | null;

function findModule(content: any[], moduleId: string | null): any | null {
  if (!moduleId) return null;
  for (const level of content) {
    for (const module of level.modules || []) {
      if (module.id === moduleId) return module;
    }
  }
  return null;
}

function findLessonWithModule(content: any[], lessonId: string | null): { lesson: any; module: any } | null {
  if (!lessonId) return null;
  for (const level of content) {
    for (const module of level.modules || []) {
      for (const lesson of module.lessons || []) {
        if (lesson.id === lessonId) return { lesson, module };
      }
    }
  }
  return null;
}

export default function AdminPage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [content, setContent] = useState<any[]>([]);
  const [learnerStats, setLearnerStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selection, setSelection] = useState<Selection>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [videoFilter, setVideoFilter] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState("05:00");
  const [newLessonHasVideo, setNewLessonHasVideo] = useState(true);
  const [newLessonTemplate, setNewLessonTemplate] = useState<"none" | "standard" | "story" | "exercise">("none");
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  useEffect(() => {
    if (!isAuthPending && session) {
      fetchData();
    }
  }, [session, isAuthPending]);

  const fetchData = async () => {
    try {
      const [courseData, stats] = await Promise.all([getCourseContent(), getLearnerStats()]);
      setContent(courseData);
      setLearnerStats(stats);
    } catch {
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

    content.forEach((level) => {
      level.modules.forEach((module: any) => {
        module.lessons.forEach((lesson: any) => {
          totalLessons++;
          if (lesson.isPublished) publishedLessons++;
          else draftLessons++;
          if (lesson.hasVideo) {
            totalVideos++;
            if (lesson.videoStatus === "uploaded") uploadedVideos++;
          }
        });
      });
    });

    const courseProgress = totalLessons > 0 ? Math.round((publishedLessons / totalLessons) * 100) : 0;
    const videoProgress = totalVideos > 0 ? Math.round((uploadedVideos / totalVideos) * 100) : 0;
    return { totalLessons, publishedLessons, draftLessons, totalVideos, uploadedVideos, courseProgress, videoProgress };
  };

  const stats = getStats();

  const openAddLessonModal = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setNewLessonTitle("");
    setNewLessonDuration("05:00");
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
      const template = newLessonTemplate === "none" ? { notes: "", adminNotes: "" } : WRITING_TEMPLATES[newLessonTemplate];
      const created = await createLesson(activeModuleId, {
        title: newLessonTitle,
        videoUrl: "",
        duration: newLessonDuration || "05:00",
        notes: template.notes,
        adminNotes: template.adminNotes,
        isPublished: false,
        hasVideo: newLessonHasVideo,
        videoStatus: "not_started",
        filmingDate: null,
      });
      setIsAddModalOpen(false);
      showSuccess(`Lesson "${newLessonTitle}" created`);
      await fetchData();
      if (created?.id) setSelection({ type: "lesson", id: created.id });
    } catch {
      showError("Failed to create lesson");
    } finally {
      setIsCreatingLesson(false);
    }
  };

  if (isLoading || isAuthPending) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const selectedModule = selection?.type === "module" ? findModule(content, selection.id) : null;
  const selectedLessonEntry = selection?.type === "lesson" ? findLessonWithModule(content, selection.id) : null;

  return (
    <div className="space-y-6">
      <StatsDashboard
        courseProgress={stats.courseProgress}
        videoProgress={stats.videoProgress}
        draftLessons={stats.draftLessons}
        publishedLessons={stats.publishedLessons}
        totalLessons={stats.totalLessons}
      />

      {learnerStats && (
        <LearnerStats
          totalUsers={learnerStats.totalUsers}
          signupsThisMonth={learnerStats.signupsThisMonth}
          totalCompletions={learnerStats.totalCompletions}
          topLessons={learnerStats.topLessons}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          videoFilter={videoFilter}
          onVideoFilterChange={setVideoFilter}
        />
        <CurriculumToolsMenu onRefetch={fetchData} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-96 shrink-0">
          <CurriculumTree
            content={content}
            selection={selection}
            onSelectModule={(id) => setSelection({ type: "module", id })}
            onSelectLesson={(id) => setSelection({ type: "lesson", id })}
            onRefetch={fetchData}
            onAddLesson={openAddLessonModal}
            searchQuery={searchQuery}
            statusFilter={statusFilter as any}
            videoFilter={videoFilter as any}
          />
        </div>

        <div className="flex-1 min-w-0 w-full">
          {selectedModule && (
            <ModulePanel
              key={selectedModule.id}
              module={selectedModule}
              onRefetch={fetchData}
              onAddLesson={() => openAddLessonModal(selectedModule.id)}
            />
          )}
          {selectedLessonEntry && (
            <LessonEditor
              key={selectedLessonEntry.lesson.id}
              lesson={selectedLessonEntry.lesson}
              moduleTitle={formatModuleTitle(selectedLessonEntry.module)}
              onRefetch={fetchData}
              onDeleted={() => setSelection({ type: "module", id: selectedLessonEntry.module.id })}
            />
          )}
          {!selection && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed border-border/60 rounded-2xl p-12">
              <Layers className="w-10 h-10 mb-4 opacity-30" />
              <p className="text-sm max-w-sm">
                Select a module or lesson from the curriculum tree to view and edit it here.
              </p>
              <p className="text-xs mt-2 flex items-center gap-1.5 opacity-70">
                <BookOpen className="w-3.5 h-3.5" /> {stats.totalLessons} lessons across {content.length} level{content.length === 1 ? "" : "s"}
              </p>
            </div>
          )}
        </div>
      </div>

      <AddLessonModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title={newLessonTitle}
        onTitleChange={setNewLessonTitle}
        duration={newLessonDuration}
        onDurationChange={setNewLessonDuration}
        hasVideo={newLessonHasVideo}
        onHasVideoChange={setNewLessonHasVideo}
        template={newLessonTemplate}
        onTemplateChange={setNewLessonTemplate}
        onSubmit={handleCreateLessonSubmit}
        isPending={isCreatingLesson}
      />
    </div>
  );
}
