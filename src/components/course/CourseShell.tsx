"use client";

import { Loader2 } from "lucide-react";
import { useCourse } from "./CourseProvider";
import PaywallGate from "./PaywallGate";

// Pure gate: resolves the loading/session state, shows the paywall for
// non-paid non-admin visitors, otherwise renders children. All visual chrome
// (top bars, navigation) lives in the route-specific layouts/pages now.
export default function CourseShell({ children }: { children: React.ReactNode }) {
  const { session, isPending, isLoading, isPaid, isAdmin } = useCourse();

  if (isLoading || (isPending && !session)) {
    return <div className="h-dvh flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin && !isPaid) {
    return <PaywallGate hasSession={!!session} />;
  }

  return <>{children}</>;
}
