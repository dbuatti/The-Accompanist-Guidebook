"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analytics } from "@/lib/analytics";

/** Client-side page-view tracking. Runs once on mount and on every route change. */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    analytics.page(pathname);
  }, [pathname]);
  return null;
}
