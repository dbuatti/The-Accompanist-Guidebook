"use client";

import { useCourse } from "./CourseProvider";
import PaywallGate from "./PaywallGate";

export default function CourseShell({ children }: { children: React.ReactNode }) {
  const { session, isPending, isLoading, isPaid, isAdmin } = useCourse();

  if (isLoading || (isPending && !session)) {
    return (
      <div className="h-dvh flex flex-col bg-background">
        <div className="h-16 border-b border-border/30 bg-background/90 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-5 sm:px-10 h-full flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 animate-pulse" />
            <div className="h-4 w-32 bg-primary/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 max-w-3xl mx-auto px-5 sm:px-10 py-8 space-y-6">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-primary/10 rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border/20 rounded-2xl bg-card/40 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 animate-pulse" />
                  <div className="h-4 flex-1 bg-primary/10 rounded animate-pulse" />
                </div>
                <div className="space-y-2 pl-11">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-3 bg-muted rounded animate-pulse" style={{ width: `${70 - j * 10}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isPaid) {
    return <PaywallGate hasSession={!!session} />;
  }

  return <>{children}</>;
}
