"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCourseContent, updateLesson, createModule, createLevel, createLesson, getLevelsOnly, updateModuleLevel } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Save, Loader2, Eye, EyeOff, BookOpen, BrainCircuit, Video, Calendar, Film, Layers } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import AdminNav from "@/components/AdminNav";
import { authClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";

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
  }, [session, isAuthPending, router]);

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
      showSuccess("Lesson updated successfully");
    } catch (error) {
      showError("Failed to update lesson");
    } finally {
      setIsSaving(null);
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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-serif font-semibold text-primary">Course Structure & Drafts</h2>
          <p className="text-sm text-muted-foreground">Draft lessons, brain dump ideas, and publish when ready.</p>
        </div>
        <Button onClick={handleAddLevel} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Level (Tier 1)
        </Button>
      </div>

      <div className="space-y-16">
        {content.map((level) => (
          <div key={level.id} className="space-y-6 bg-primary/5 p-6 rounded-2xl border border-primary/10">
            {/* Tier 1: Level Header */}
            <div className="flex items-center justify-between border-b border-primary/20 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-serif font-bold text-primary">{level.title}</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleAddModule(level.id)}>
                <Plus className="w-4 h-4 mr-2" /> Add Module (Tier 2)
              </Button>
            </div>

            <div className="space-y-10 pl-4">
              {level.modules.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No modules in this level yet.</p>
              ) : (
                level.modules.map((module: any) => (
                  <div key={module.id} className="space-y-4">
                    {/* Tier 2: Module Header */}
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-4">
                        <h4 className="text-lg font-serif font-medium text-foreground">{module.title}</h4>
                        <Select
                          value={module.levelId || ""}
                          onValueChange={(val) => handleMoveModule(module.id, val)}
                        >
                          <SelectTrigger className="w-48 h-8 text-xs bg-background">
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
                      <Button variant="ghost" size="sm" onClick={() => handleAddLesson(module.id)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Lesson Draft (Tier 3)
                      </Button>
                    </div>

                    {/* Tier 3: Lessons */}
                    <div className="grid gap-6">
                      {module.lessons.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic pl-2">No lessons in this module yet.</p>
                      ) : (
                        module.lessons.map((lesson: any) => (
                          <Card key={lesson.id} className="bg-card/50 border-border/60 shadow-sm">
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
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleUpdateLesson(lesson.id, lesson)}
                                    disabled={isSaving === lesson.id}
                                  >
                                    {isSaving === lesson.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save
                                  </Button>
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
                                    className="bg-background border-border/80"
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
                                    className="bg-background border-border/80"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}