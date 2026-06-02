"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Timer, Play, Pause, RotateCcw, Minimize2, FileText, 
  BookOpen, BrainCircuit, Loader2, Save, Wand2 
} from "lucide-react";

interface ZenFocusModeProps {
  lesson: any;
  onClose: () => void;
  timerMode: "focus" | "break";
  pomodoroTime: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onApplyTemplate: (key: "standard" | "story" | "exercise") => void;
  onGenerateWithGemini: (id: string) => void;
  isGenerating: boolean;
  isSaving: boolean;
  onSave: (id: string, data: any) => void;
  onLessonChange: (field: string, value: any) => void;
}

export default function ZenFocusMode({
  lesson,
  onClose,
  timerMode,
  pomodoroTime,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onApplyTemplate,
  onGenerateWithGemini,
  isGenerating,
  isSaving,
  onSave,
  onLessonChange,
}: ZenFocusModeProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col p-6 md:p-12 overflow-y-auto animate-in fade-in duration-200">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent fill-accent" /> Zen Focus Mode
              </Badge>
              {lesson.isPublished ? (
                <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Published</Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-500/20">Draft</Badge>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mt-1">
              {lesson.title || "Untitled Lesson"}
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
                onClick={onToggleTimer}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 text-primary hover:bg-primary/10"
                onClick={onResetTimer}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <Minimize2 className="w-5 h-5 mr-2" /> Exit Focus
          </Button>
        </div>

        {/* ADHD Writing Templates Quick Bar */}
        <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider">ADHD Writing Templates (Overcome Blank Page Anxiety)</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => onApplyTemplate("standard")} className="text-xs h-8">
              Standard Lesson
            </Button>
            <Button size="sm" variant="outline" onClick={() => onApplyTemplate("story")} className="text-xs h-8">
              Story-Driven
            </Button>
            <Button size="sm" variant="outline" onClick={() => onApplyTemplate("exercise")} className="text-xs h-8">
              Exercise & Practice
            </Button>
            <Button 
              size="sm" 
              className="text-xs h-8 bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1"
              onClick={() => onGenerateWithGemini(lesson.id)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5" />
              )}
              Generate with Gemini AI
            </Button>
          </div>
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
              value={lesson.notes || ""} 
              onChange={(e) => onLessonChange("notes", e.target.value)}
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
              value={lesson.adminNotes || ""} 
              onChange={(e) => onLessonChange("adminNotes", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="zen-publish"
              checked={lesson.isPublished}
              onCheckedChange={(checked) => onLessonChange("isPublished", checked)}
            />
            <Label htmlFor="zen-publish" className="text-sm font-medium cursor-pointer">
              {lesson.isPublished ? "Published" : "Draft"}
            </Label>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
            <Button 
              onClick={() => onSave(lesson.id, lesson)}
              disabled={isSaving}
              className="px-6"
            >
              {isSaving ? (
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
  );
}