"use client";

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
        <CardContent className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> Lessons Live
          </p>
          <h3 className="text-2xl font-serif font-bold text-primary mt-1">{courseProgress}%</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {publishedLessons} of {totalLessons} lessons published
          </p>
          <Progress value={courseProgress} className="h-1.5 w-full bg-primary/10 mt-3" />
        </CardContent>
      </Card>

      <Card className="bg-card/40 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Film className="w-3 h-3" /> Video Production
          </p>
          <h3 className="text-2xl font-serif font-bold text-accent mt-1">{videoProgress}%</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Of lessons that require video</p>
          <Progress value={videoProgress} className="h-1.5 w-full bg-accent/10 mt-3" />
        </CardContent>
      </Card>

      <Card className="bg-card/40 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="w-3 h-3" /> Drafts vs Published
          </p>
          <h3 className="text-2xl font-serif font-bold text-foreground mt-1">
            {draftLessons} <span className="text-sm font-sans font-normal text-muted-foreground">drafts</span>{" "}
            <span className="text-muted-foreground/50">/</span> {publishedLessons}{" "}
            <span className="text-sm font-sans font-normal text-muted-foreground">live</span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Total of {totalLessons} lessons</p>
          <Progress value={courseProgress} className="h-1.5 w-full bg-primary/10 mt-3" />
        </CardContent>
      </Card>
    </div>
  );
}