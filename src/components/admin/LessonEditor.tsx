"use client";

import { useState } from "react";
import { updateLesson, deleteLesson, generateLessonNotes } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Eye, EyeOff, Film, Wand2, Loader2, Save, Trash2, Video, Calendar,
  BookOpen, BrainCircuit, StickyNote, ClipboardCopy, FileText,
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import VideoPlayer from "@/components/VideoPlayer";
import ResourceManager from "@/components/admin/ResourceManager";
import BlockEditor, { DocBlock, parseNotesToBlocks, blocksToNotes } from "@/components/admin/BlockEditor";

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

export const WRITING_TEMPLATES: Record<"standard" | "story" | "exercise", { notes: string; adminNotes: string }> = {
  standard: {
    notes: `### Lesson Overview\n[Provide a 2-sentence summary of what this lesson covers.]\n\n### Key Concepts\n1. **Concept One**: [Brief explanation]\n2. **Concept Two**: [Brief explanation]\n\n### Daniele's Pro-Tip\n> [Insert a golden nugget of real-world advice here!]\n\n### Action Steps\n- [Action step 1]\n- [Action step 2]`,
    adminNotes: `### Video Outline\n- Intro (0:00 - 1:00)\n- Main Concept (1:00 - 3:30)\n- Demonstration (3:30 - 5:00)\n- Outro & Next Steps (5:00 - 6:00)\n\n### Props/Materials Needed\n- [e.g., Sheet music binder, iPad]`,
  },
  story: {
    notes: `### The Story\n[Tell a captivating story from an audition room or performance that illustrates the lesson's core point.]\n\n### The Moral of the Story\n[Explain the musical or professional lesson learned from this experience.]\n\n### Daniele's Pro-Tip\n> [Insert a golden nugget of real-world advice here!]\n\n### How to Apply This\n- [Practical application 1]\n- [Practical application 2]`,
    adminNotes: `### Story Outline\n- Who was involved?\n- What went wrong/right?\n- What was the turning point?\n\n### Key Takeaways to Emphasize\n- [e.g., Always keep page one visible]`,
  },
  exercise: {
    notes: `### The Goal\n[What skill or technique will the student master by doing this exercise?]\n\n### Step-by-Step Exercise\n1. **Step 1**: [Instructions]\n2. **Step 2**: [Instructions]\n3. **Step 3**: [Instructions]\n\n### Daniele's Pro-Tip\n> [Insert a golden nugget of real-world advice here!]\n\n### Practice Schedule\n- Practice this [X] times a day for [Y] days.`,
    adminNotes: `### Demonstration Plan\n- Show the incorrect way first (common mistake)\n- Show the correct way\n- Break down the physical/vocal adjustments`,
  },
};

interface LessonEditorProps {
  lesson: any;
  moduleTitle: string;
  onRefetch: () => void | Promise<void>;
  onDeleted: () => void;
}

export default function LessonEditor({ lesson, moduleTitle, onRefetch, onDeleted }: LessonEditorProps) {
  const [title, setTitle] = useState(lesson.title);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "");
  const [duration, setDuration] = useState(lesson.duration || "05:00");
  const [isPublished, setIsPublished] = useState(!!lesson.isPublished);
  const [hasVideo, setHasVideo] = useState(lesson.hasVideo ?? true);
  const [videoStatus, setVideoStatus] = useState(lesson.videoStatus || "not_started");
  const [filmingDate, setFilmingDate] = useState(lesson.filmingDate ? new Date(lesson.filmingDate).toISOString().split("T")[0] : "");
  const [adminNotes, setAdminNotes] = useState(lesson.adminNotes || "");
  const [cliffnotes, setCliffnotes] = useState(lesson.cliffnotes || "");
  const [blocks, setBlocks] = useState<DocBlock[]>(() => parseNotesToBlocks(lesson.notes || ""));

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLesson(lesson.id, {
        title,
        videoUrl,
        notes: blocksToNotes(blocks),
        adminNotes,
        cliffnotes,
        isPublished,
        duration,
        hasVideo,
        videoStatus,
        filmingDate: filmingDate ? new Date(filmingDate) : null,
      });
      showSuccess("Lesson saved");
      await onRefetch();
    } catch {
      showError("Failed to save lesson");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteLesson(lesson.id);
      showSuccess("Lesson deleted");
      onDeleted();
      await onRefetch();
    } catch {
      showError("Failed to delete lesson");
      setIsDeleting(false);
    }
  };

  const handleGenerateWithGemini = async () => {
    setIsGenerating(true);
    try {
      const result = await generateLessonNotes(lesson.id);
      if (result.success && result.notes) {
        setBlocks(parseNotesToBlocks(result.notes));
        showSuccess("Gemini AI has written your lesson notes");
      }
    } catch (error: any) {
      showError(error.message || "Failed to generate notes with Gemini AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyTemplate = (key: "standard" | "story" | "exercise") => {
    const currentNotes = blocksToNotes(blocks).trim();
    if (currentNotes && !confirm("This will overwrite your current notes with the template. Are you sure?")) return;
    const template = WRITING_TEMPLATES[key];
    setBlocks(parseNotesToBlocks(template.notes));
    setAdminNotes(template.adminNotes);
    showSuccess("Template applied");
  };

  const handleCopyPrompt = async () => {
    const prompt = `You are Daniele Buatti, a professional Music Director, Audition Pianist, and Voice Coach.
I want you to write a comprehensive, engaging, and highly practical lesson for my "Audition Guidebook" course.

LESSON TITLE: "${title}"
CURRENT OUTLINE / NOTES:
${blocksToNotes(blocks) || "No notes written yet."}

BACK-END DRAFT NOTES / BRAIN DUMP:
${adminNotes || "No private draft notes written yet."}

Please write the complete, client-facing lesson notes. Use a warm, professional, and encouraging tone. Include:
1. A clear, practical explanation of the concept.
2. Real-world audition room examples or stories.
3. A "Daniele's Pro-Tip" callout box.
4. Actionable steps the student can take right now to prepare.`;
    try {
      await navigator.clipboard.writeText(prompt);
      showSuccess("AI prompt copied to clipboard");
    } catch {
      showError("Failed to copy prompt");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{moduleTitle}</p>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="ghost" onClick={handleDelete} disabled={isDeleting || isSaving} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || isDeleting} className="h-8 text-xs">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />} Save
              </Button>
            </div>
          </div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 text-lg font-serif font-bold text-primary border-transparent px-0 focus-visible:ring-0 focus-visible:border-b focus-visible:border-primary/30 rounded-none" />
          <div className="flex items-center gap-4 flex-wrap">
            {isPublished ? (
              <Badge className="bg-green-500/10 text-green-700 border-green-500/20 flex items-center gap-1"><Eye className="w-3 h-3" /> Published</Badge>
            ) : (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-500/20 flex items-center gap-1"><EyeOff className="w-3 h-3" /> Draft</Badge>
            )}
            {hasVideo && (
              <Badge variant="outline" className={`flex items-center gap-1 ${STATUS_COLORS[videoStatus] || ""}`}>
                <Film className="w-3 h-3" /> {STATUS_LABELS[videoStatus] || "Not Started"}
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <Switch id="lesson-publish" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="lesson-publish" className="text-xs font-medium cursor-pointer">{isPublished ? "Published" : "Draft"}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video tracking */}
      <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Video Production</span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="lesson-has-video" checked={hasVideo} onCheckedChange={setHasVideo} />
            <Label htmlFor="lesson-has-video" className="text-xs font-medium cursor-pointer">Requires Video</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Duration (e.g., 08:45)</label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} className="h-9 text-sm bg-background" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Video URL (YouTube)</label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="h-9 text-sm bg-background" />
          </div>
        </div>

        {hasVideo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Video Status</label>
              <Select value={videoStatus} onValueChange={setVideoStatus}>
                <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="Select status" /></SelectTrigger>
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
                <Input type="date" value={filmingDate} onChange={(e) => setFilmingDate(e.target.value)} className="h-9 text-xs bg-background pl-8" />
                <Calendar className="w-4 h-4 text-muted-foreground absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="pt-1">
            <VideoPlayer url={videoUrl} onComplete={() => {}} initialTime={0} onProgress={() => {}} />
          </div>
        )}
      </div>

      {/* Writing templates + AI tools */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">Templates:</span>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleApplyTemplate("standard")}><FileText className="w-3.5 h-3.5 mr-1.5" /> Standard</Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleApplyTemplate("story")}><FileText className="w-3.5 h-3.5 mr-1.5" /> Story-Driven</Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleApplyTemplate("exercise")}><FileText className="w-3.5 h-3.5 mr-1.5" /> Exercise</Button>
        <span className="w-px h-5 bg-border mx-1" />
        <Button variant="outline" size="sm" className="h-8 text-xs border-amber-500/30 text-amber-700 hover:bg-amber-500/5" onClick={handleGenerateWithGemini} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1.5" />} Generate with AI
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleCopyPrompt}>
          <ClipboardCopy className="w-3.5 h-3.5 mr-1.5" /> Copy AI Prompt
        </Button>
      </div>

      {/* Notes editor */}
      <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Client-Facing Notes</span>
        </div>
        <p className="text-[11px] text-muted-foreground">These notes are visible to students in the portal.</p>
        <BlockEditor blocks={blocks} onChange={setBlocks} />
      </div>

      {/* Admin notes */}
      <div className="space-y-2 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
        <div className="flex items-center gap-2 text-amber-700">
          <BrainCircuit className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Back-End / Draft Notes</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Private brain dumps, outlines, and raw ideas. Only visible to admins.</p>
        <Textarea rows={5} placeholder="Brain dump your ideas, curriculum outlines, or raw thoughts here..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="bg-background border-border/80 text-sm" />
      </div>

      {/* Cliffnotes */}
      <div className="space-y-2 bg-accent/5 p-4 rounded-xl border border-accent/10">
        <div className="flex items-center gap-2 text-accent-foreground">
          <StickyNote className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Cliffnotes</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Filming prompts — quick bullets to read while recording.</p>
        <Textarea rows={4} placeholder="Bullet-point filming prompts..." value={cliffnotes} onChange={(e) => setCliffnotes(e.target.value)} className="bg-background border-border/80 text-sm" />
      </div>

      {/* Resources */}
      <div className="pt-2 border-t border-border/40">
        <ResourceManager lessonId={lesson.id} resources={lesson.resources || []} onAdd={() => onRefetch()} onDelete={() => onRefetch()} />
      </div>
    </div>
  );
}
