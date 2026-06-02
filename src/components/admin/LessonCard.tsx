"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Eye, EyeOff, Film, Maximize2, Wand2, Loader2, Save, Trash2, Video, Calendar, BookOpen, BrainCircuit 
} from "lucide-react";

interface LessonCardProps {
  lesson: any;
  onFocus: (lesson: any) => void;
  onGenerateWithGemini: (id: string) => void;
  isGenerating: boolean;
  onSave: (id: string, data: any) => void;
  isSaving: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onFieldChange: (lessonId: string, field: string, value: any) => void;
  energyColors: Record<string, string>;
  energyIcons: Record<string, any>;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}

export default function LessonCard({
  lesson,
  onFocus,
  onGenerateWithGemini,
  isGenerating,
  onSave,
  isSaving,
  onDelete,
  isDeleting,
  onFieldChange,
  energyColors,
  energyIcons,
  statusColors,
  statusLabels,
}: LessonCardProps) {
  const lessonEnergy = lesson.energyLevel || "medium";
  const EnergyIcon = energyIcons[lessonEnergy];

  return (
    <Card className="bg-card/50 border-border/60 shadow-sm hover:shadow-md transition-all">
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
              <Badge variant="outline" className={`flex items-center gap-1 ${statusColors[lesson.videoStatus] || ""}`}>
                <Film className="w-3 h-3" /> {statusLabels[lesson.videoStatus] || "Not Started"}
              </Badge>
            )}
            <Badge variant="outline" className={`flex items-center gap-1 ${energyColors[lessonEnergy]}`}>
              <EnergyIcon className="w-3.5 h-3.5" /> {lessonEnergy.toUpperCase()} ENERGY
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id={`publish-${lesson.id}`}
                checked={lesson.isPublished}
                onCheckedChange={(checked) => onFieldChange(lesson.id, "isPublished", checked)}
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
                onClick={() => onFocus(lesson)}
              >
                <Maximize2 className="w-3.5 h-3.5 mr-1" /> Focus
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 text-xs border-amber-500/30 text-amber-700 hover:bg-amber-500/5 flex items-center gap-1"
                onClick={() => onGenerateWithGemini(lesson.id)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                Gemini AI
              </Button>
              <Button 
                size="sm" 
                onClick={() => onSave(lesson.id, lesson)}
                disabled={isSaving || isDeleting}
                className="h-8 text-xs"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                Save
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                onClick={() => onDelete(lesson.id)}
                disabled={isSaving || isDeleting}
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Lesson Title</label>
            <Input 
              value={lesson.title} 
              onChange={(e) => onFieldChange(lesson.id, "title", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Duration (e.g., 08:45)</label>
            <Input 
              value={lesson.duration} 
              onChange={(e) => onFieldChange(lesson.id, "duration", e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Energy Level Required</label>
            <Select
              value={lesson.energyLevel || "medium"}
              onValueChange={(val) => onFieldChange(lesson.id, "energyLevel", val)}
            >
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Select energy level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Energy (Quick Tasks)</SelectItem>
                <SelectItem value="medium">Medium Energy</SelectItem>
                <SelectItem value="high">High Energy (Deep Focus)</SelectItem>
              </SelectContent>
            </Select>
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
                onCheckedChange={(checked) => onFieldChange(lesson.id, "hasVideo", checked)}
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
                  onValueChange={(val) => onFieldChange(lesson.id, "videoStatus", val)}
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
                    onChange={(e) => onFieldChange(lesson.id, "filmingDate", e.target.value ? new Date(e.target.value) : null)}
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
                  onChange={(e) => onFieldChange(lesson.id, "videoUrl", e.target.value)}
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
              onChange={(e) => onFieldChange(lesson.id, "notes", e.target.value)}
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
              onChange={(e) => onFieldChange(lesson.id, "adminNotes", e.target.value)}
              className="bg-background border-border/80 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}