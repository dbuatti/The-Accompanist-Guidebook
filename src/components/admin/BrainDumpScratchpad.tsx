"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StickyNote, Zap, Maximize2 } from "lucide-react";

interface BrainDumpScratchpadProps {
  scratchpad: string;
  onScratchpadChange: (val: string) => void;
  nextAction: any;
  onFocusNextAction: (action: any) => void;
}

export default function BrainDumpScratchpad({
  scratchpad,
  onScratchpadChange,
  nextAction,
  onFocusNextAction,
}: BrainDumpScratchpadProps) {
  return (
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
            onChange={(e) => onScratchpadChange(e.target.value)}
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
          {nextAction ? (
            <div className="space-y-1 bg-background/60 p-3 rounded-xl border border-primary/10">
              <p className="text-xs font-bold text-primary truncate">{nextAction.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{nextAction.moduleTitle}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">All lessons are published! You are a superstar! 🌟</p>
          )}
          {nextAction && (
            <Button 
              size="sm" 
              className="w-full bg-primary hover:bg-primary/90 text-xs h-8"
              onClick={() => onFocusNextAction(nextAction)}
            >
              <Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Focus on This Lesson
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}