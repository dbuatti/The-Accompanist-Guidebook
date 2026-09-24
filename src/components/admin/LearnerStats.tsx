"use client";

import { UserRound, TrendingUp, Award, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LearnerStatsProps {
  totalUsers: number;
  signupsThisMonth: number;
  totalCompletions: number;
  topLessons: { lesson: { title: string } | null; completions: number }[];
}

export default function LearnerStats({
  totalUsers,
  signupsThisMonth,
  totalCompletions,
  topLessons,
}: LearnerStatsProps) {
  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/40 border-border/50 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserRound className="w-3 h-3" /> Total Learners
            </p>
            <h3 className="text-2xl font-serif font-bold text-primary mt-1">{totalUsers}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Registered members</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/50 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> New This Month
            </p>
            <h3 className="text-2xl font-serif font-bold text-primary mt-1">{signupsThisMonth}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Signups in the last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/50 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="w-3 h-3" /> Total Completions
            </p>
            <h3 className="text-2xl font-serif font-bold text-primary mt-1">{totalCompletions}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Lessons completed by all learners</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40 border-border/50 shadow-sm">
        <CardContent className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Most-Completed Lessons
          </p>
          {topLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-6 text-muted-foreground">
              <Award className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No completions yet.</p>
              <p className="text-xs mt-1 opacity-70">Once learners finish lessons, their top ones will show up here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topLessons.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium text-foreground/80 truncate flex-1">
                    {item.lesson?.title || "Unknown lesson"}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 font-mono">
                    {item.completions} {item.completions === 1 ? "completion" : "completions"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}