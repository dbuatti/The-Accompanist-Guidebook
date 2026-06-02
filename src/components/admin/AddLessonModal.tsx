"use client";

import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Sparkles, Video, FileText, Plus, Loader2 } from "lucide-react";

interface AddLessonModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (val: string) => void;
  duration: string;
  onDurationChange: (val: string) => void;
  energy: string;
  onEnergyChange: (val: string) => void;
  hasVideo: boolean;
  onHasVideoChange: (val: boolean) => void;
  template: string;
  onTemplateChange: (val: any) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export default function AddLessonModal({
  isOpen,
  onOpenChange,
  title,
  onTitleChange,
  duration,
  onDurationChange,
  energy,
  onEnergyChange,
  hasVideo,
  onHasVideoChange,
  template,
  onTemplateChange,
  onSubmit,
  isPending,
}: AddLessonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border/50 rounded-2xl shadow-2xl">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-serif font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent fill-accent" />
            Create New Lesson Draft
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Set up your lesson draft with ADHD-friendly templates and energy mapping.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="lesson-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Lesson Title
            </Label>
            <Input
              id="lesson-title"
              placeholder="e.g., The Golden Rule of Auditioning"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="h-10 bg-background border-border/80 text-sm"
              autoFocus
            />
          </div>

          {/* Duration & Energy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lesson-duration" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Duration (MM:SS)
              </Label>
              <Input
                id="lesson-duration"
                placeholder="05:00"
                value={duration}
                onChange={(e) => onDurationChange(e.target.value)}
                className="h-10 bg-background border-border/80 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lesson-energy" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Energy Level Required
              </Label>
              <Select value={energy} onValueChange={onEnergyChange}>
                <SelectTrigger id="lesson-energy" className="h-10 bg-background border-border/80 text-xs">
                  <SelectValue placeholder="Select energy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Energy (Quick Tasks)</SelectItem>
                  <SelectItem value="medium">Medium Energy</SelectItem>
                  <SelectItem value="high">High Energy (Deep Focus)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Video Requirement Toggle */}
          <div className="flex items-center justify-between bg-secondary/30 p-3 rounded-xl border border-border/50">
            <div className="space-y-0.5">
              <Label htmlFor="lesson-video-toggle" className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Video className="w-4 h-4" /> Requires Video
              </Label>
              <p className="text-[10px] text-muted-foreground">Toggle if this lesson needs a filmed video.</p>
            </div>
            <Switch
              id="lesson-video-toggle"
              checked={hasVideo}
              onCheckedChange={onHasVideoChange}
            />
          </div>

          {/* ADHD Writing Template Pre-selection */}
          <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
            <Label htmlFor="lesson-template" className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-accent" /> Pre-Apply Writing Template
            </Label>
            <p className="text-[10px] text-muted-foreground mb-2">
              Defeat blank-page anxiety! Pre-populate your draft with a structured outline.
            </p>
            <Select value={template} onValueChange={onTemplateChange}>
              <SelectTrigger id="lesson-template" className="h-9 bg-background border-border/80 text-xs">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Blank Slate (No Template)</SelectItem>
                <SelectItem value="standard">Standard Lesson Template</SelectItem>
                <SelectItem value="story">Story-Driven Lesson Template</SelectItem>
                <SelectItem value="exercise">Exercise & Practice Template</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="border-t border-border/50 pt-4 flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 text-xs">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isPending} className="h-10 text-xs bg-primary">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Draft...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" />
                Create Lesson Draft
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}