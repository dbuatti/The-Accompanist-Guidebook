"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { showSuccess, showError } from "@/utils/toast";
import {
  ensureUserExists,
  getCourseContent,
  getPaidStatus,
  getProgress,
  publishAllLessons,
  toggleLessonProgress,
  verifyAndApplyPurchase,
} from "@/app/actions";
import { ADMIN_EMAILS } from "@/lib/admin";
import { formatModuleTitle } from "@/lib/utils";

interface AdjacentLesson {
  href: string;
  title: string;
  moduleTitle: string;
}

interface CourseContextValue {
  session: any;
  isPending: boolean;
  content: any[];
  isLoading: boolean;
  progressData: any[];
  isPaid: boolean;
  isAdmin: boolean;
  expandedLevels: Record<string, boolean>;
  toggleLevel: (id: string) => void;
  isLessonCompleted: (id: string) => boolean;
  toggleComplete: (id: string) => Promise<void>;
  publishAll: () => Promise<void>;
  logout: () => Promise<void>;
  getModule: (moduleSlug: string) => any | null;
  getLesson: (moduleSlug: string, lessonSlug: string) => any | null;
  getAdjacentLesson: (moduleSlug: string, lessonSlug: string) => { prev?: AdjacentLesson; next?: AdjacentLesson };
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourse must be used within CourseProvider");
  return ctx;
}

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isPaid, setIsPaid] = useState(false);

  const isAdmin = !!(session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase()));

  useEffect(() => {
    if (session?.user) ensureUserExists();
  }, [session]);

  const fetchData = async () => {
    try {
      let paid = false;
      if (session?.user?.id) {
        const [progress, p] = await Promise.all([getProgress(), getPaidStatus()]);
        setProgressData(progress);
        setIsPaid(p.isPaid);
        paid = p.isPaid;
      }
      if (session?.user?.id && !paid) {
        const v = await verifyAndApplyPurchase();
        if (v.isPaid) {
          setIsPaid(true);
          paid = true;
        }
      }
      const data = await getCourseContent();
      setContent(data);
      if (data.length > 0) {
        const allExpanded: Record<string, boolean> = {};
        for (const level of data) allExpanded[level.id] = true;
        setExpandedLevels(allExpanded);
      }
    } catch {
      showError("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPending) return;
    if (!session?.user?.id) {
      // Anonymous visitor: no session means unpaid by definition, so there's
      // nothing to fetch — resolve loading so CourseShell can show the paywall.
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [isPending, session?.user?.id]);

  // Handle return from Stripe: ?paid=1 (or a pending_paid cookie set for
  // anonymous buyers who had to sign in before the flag could be applied).
  useEffect(() => {
    if (isPending) return;
    const params = new URLSearchParams(window.location.search);
    const hasPaidParam = params.get("paid") === "1";
    const hasPendingCookie = document.cookie.split(";").some((c) => c.trim().startsWith("pending_paid=1"));
    if (!hasPaidParam && !hasPendingCookie) return;

    if (!session?.user) {
      document.cookie = "pending_paid=1; path=/; max-age=3600";
      router.push("/auth/sign-in");
      return;
    }

    const applyPurchase = async () => {
      document.cookie = "pending_paid=1; path=/; max-age=0";
      params.delete("paid");
      window.history.replaceState({}, "", window.location.pathname + params.toString());
      const result = await verifyAndApplyPurchase();
      if (result.isPaid) {
        setIsPaid(true);
        showSuccess("Course unlocked, welcome aboard!");
      } else {
        showError("We couldn't verify your payment yet. It usually appears within a minute, try again shortly.");
      }
      fetchData();
    };
    applyPurchase();
  }, [session, isPending]);

  const isLessonCompleted = useCallback(
    (id: string) => progressData.some((p) => p.lessonId === id && p.completedAt),
    [progressData]
  );

  const toggleComplete = useCallback(async (lessonId: string) => {
    try {
      await toggleLessonProgress(lessonId);
      setProgressData(await getProgress());
      showSuccess("Progress updated!");
    } catch {
      showError("Failed to update progress");
    }
  }, []);

  const publishAll = useCallback(async () => {
    if (!confirm("Publish ALL lessons so they're visible to everyone?")) return;
    try {
      await publishAllLessons();
      showSuccess("All lessons published!");
      fetchData();
    } catch {
      showError("Failed to publish");
    }
  }, []);

  const logout = useCallback(async () => {
    await authClient.signOut();
    router.push("/");
  }, [router]);

  const getModule = useCallback((moduleSlug: string) => {
    if (!moduleSlug) return null;
    for (const level of content) for (const mod of level.modules || []) if (mod.slug === moduleSlug) return mod;
    return null;
  }, [content]);

  const getLesson = useCallback(
    (moduleSlug: string, lessonSlug: string) => {
      const mod = getModule(moduleSlug);
      return mod?.lessons?.find((l: any) => l.slug === lessonSlug) || null;
    },
    [getModule]
  );

  const getAdjacentLesson = useCallback(
    (moduleSlug: string, lessonSlug: string) => {
      const flat: AdjacentLesson[] = [];
      for (const level of content) {
        for (const mod of level.modules || []) {
          const moduleTitle = formatModuleTitle(mod);
          for (const lesson of mod.lessons || []) {
            flat.push({ href: `/modules/${mod.slug}/${lesson.slug}`, title: lesson.title, moduleTitle });
          }
        }
      }
      const idx = flat.findIndex((e) => e.href === `/modules/${moduleSlug}/${lessonSlug}`);
      if (idx === -1) return { prev: undefined, next: undefined };
      return { prev: idx > 0 ? flat[idx - 1] : undefined, next: idx < flat.length - 1 ? flat[idx + 1] : undefined };
    },
    [content]
  );

  const toggleLevel = useCallback((id: string) => setExpandedLevels((p) => ({ ...p, [id]: !p[id] })), []);

  return (
    <CourseContext.Provider
      value={{
        session,
        isPending,
        content,
        isLoading,
        progressData,
        isPaid,
        isAdmin,
        expandedLevels,
        toggleLevel,
        isLessonCompleted,
        toggleComplete,
        publishAll,
        logout,
        getModule,
        getLesson,
        getAdjacentLesson,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}
