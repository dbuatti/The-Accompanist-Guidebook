"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, Pencil, ExternalLink, Activity } from "lucide-react";
import { getContentHealth, syncYoutubeDurations } from "@/app/actions";
import type { LessonHealth, HealthFlag } from "@/server/services/contentHealth";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";

const FLAG_LABEL: Record<HealthFlag, string> = {
  no_video: "No video",
  video_not_uploaded: "Video status not 'uploaded'",
  thin_notes: "Notes under 100 words",
  no_cliffnotes: "No cliff notes",
  no_resources: "No resources",
  draft: "Draft",
  placeholder_duration: "Duration not set",
};

const FLAG_TONE: Record<HealthFlag, string> = {
  no_video: "bg-red-500/10 text-red-700 dark:text-red-300",
  thin_notes: "bg-red-500/10 text-red-700 dark:text-red-300",
  draft: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
  video_not_uploaded: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
  no_cliffnotes: "bg-muted text-muted-foreground",
  no_resources: "bg-muted text-muted-foreground",
  placeholder_duration: "bg-muted text-muted-foreground",
};

function scoreTone(score: number) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 55) return "text-amber-600";
  return "text-red-600";
}

export default function ContentHealthPage() {
  const [rows, setRows] = useState<LessonHealth[] | null>(null);
  const [onlyNeedsWork, setOnlyNeedsWork] = useState(true);
  const [flagFilter, setFlagFilter] = useState<HealthFlag | "all">("all");
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    try {
      setRows(await getContentHealth());
    } catch {
      showError("Couldn't load content health");
      setRows([]);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await syncYoutubeDurations();
      showSuccess(`Durations: ${r.updated} updated, ${r.unchanged} already right${r.failed.length ? `, ${r.failed.length} couldn't be read` : ""}`);
      await load();
    } catch {
      showError("Couldn't sync durations");
    } finally {
      setSyncing(false);
    }
  };

  const modules = useMemo(() => {
    const groups = new Map<string, { title: string; level: string; slug: string; lessons: LessonHealth[] }>();
    for (const r of rows ?? []) {
      if (onlyNeedsWork && r.flags.length === 0) continue;
      if (flagFilter !== "all" && !r.flags.includes(flagFilter)) continue;
      if (!groups.has(r.moduleId)) groups.set(r.moduleId, { title: r.moduleTitle, level: r.levelTitle, slug: r.moduleSlug, lessons: [] });
      groups.get(r.moduleId)!.lessons.push(r);
    }
    return [...groups.values()];
  }, [rows, onlyNeedsWork, flagFilter]);

  const totals = useMemo(() => {
    const t: Record<HealthFlag, number> = { no_video: 0, video_not_uploaded: 0, thin_notes: 0, no_cliffnotes: 0, no_resources: 0, draft: 0, placeholder_duration: 0 };
    for (const r of rows ?? []) for (const f of r.flags) t[f]++;
    const avg = rows && rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0;
    return { t, avg, complete: (rows ?? []).filter((r) => r.flags.length === 0).length };
  }, [rows]);

  if (!rows) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Content health
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-primary">What needs work</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totals.complete} of {rows.length} lessons complete · average {totals.avg}%
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
          {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Sync durations from YouTube
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFlagFilter("all")}
          className={`rounded-full border px-3 py-1 text-xs ${flagFilter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
        >
          All issues
        </button>
        {(Object.keys(FLAG_LABEL) as HealthFlag[]).map((f) => (
          <button
            key={f}
            onClick={() => setFlagFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs ${flagFilter === f ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
          >
            {FLAG_LABEL[f]} · {totals.t[f]}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={onlyNeedsWork} onChange={(e) => setOnlyNeedsWork(e.target.checked)} />
          Hide complete lessons
        </label>
      </div>

      <div className="mt-8 space-y-8">
        {modules.length === 0 && <p className="text-sm text-muted-foreground">Nothing matches. Nice.</p>}
        {modules.map((m) => (
          <section key={m.slug} className="rounded-2xl border border-border/50 bg-card/40">
            <header className="flex items-baseline justify-between border-b border-border/40 px-5 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">{m.level}</p>
                <h2 className="font-serif text-lg font-semibold text-primary">{m.title}</h2>
              </div>
              <Link href={`/modules/${m.slug}`} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                View as student <ExternalLink className="h-3 w-3" />
              </Link>
            </header>
            <ul className="divide-y divide-border/40">
              {m.lessons.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className={`w-10 shrink-0 text-sm font-semibold tabular-nums ${scoreTone(l.score)}`}>{l.score}%</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{l.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {l.noteWords} words · {l.resourceCount} resource{l.resourceCount === 1 ? "" : "s"}
                      {l.hasVideo ? ` · ${l.duration || "no duration"}` : " · no video needed"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {l.flags.map((f) => (
                      <span key={f} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${FLAG_TONE[f]}`}>
                        {FLAG_LABEL[f]}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/admin?lesson=${l.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-primary hover:bg-primary/5"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
