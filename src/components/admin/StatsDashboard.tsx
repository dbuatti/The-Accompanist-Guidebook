"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Film, BarChart3 } from "lucide-react";

interface StatsDashboardProps {
  courseProgress: number;
  videoProgress: number;
  draftLessons: number;
  publishedLessons: number;
  totalLessons: number;
}

export default function StatsDashboard({
  courseProgress,
  videoProgress,
  draftLessons,
  publishedLessons,
  totalLessons,
}: StatsDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-card/40 border-border/50 shadow-sm">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Completion</p>
            <h3 className="text-2xl font-serif font-bold text-primary">{courseProgress}%</h3>
            <Progress value={courseProgress} className="h-1.5 w-32 bg-primary/10" />
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
            <h3 className="text-2xl font-serif font-bold text-accent">{videoProgress}%</h3>
            <Progress value={videoProgress} className="h-1.5 w-32 bg-accent/10" />
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
              {draftLessons} <span className="text-sm font-sans font-normal text-muted-foreground">drafts</span> / {publishedLessons} <span className="text-sm font-sans font-normal text-muted-foreground">live</span>
            </h3>
            <p className="text-[11px] text-muted-foreground">Total of {totalLessons} lessons</p>
          </div>
          <div className="p-3 rounded-xl bg-muted text-muted-foreground">
            <BarChart3 className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}