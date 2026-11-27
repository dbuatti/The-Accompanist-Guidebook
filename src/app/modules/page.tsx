"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCourse } from "@/components/course/CourseProvider";
import CourseHeader from "@/components/course/CourseHeader";
import CurriculumView from "@/components/course/CurriculumView";

export default function ModulesPage() {
  const { session, isAdmin, isPaid, isLoading, logout } = useCourse();
  const router = useRouter();

  // Non-paid, non-admin learners hit the paywall on /welcome instead of the course.
  useEffect(() => {
    if (isLoading || !session) return;
    if (!isAdmin && !isPaid) {
      router.replace("/welcome");
    }
  }, [session, isAdmin, isPaid, isLoading, router]);

  return (
    <div className="min-h-dvh bg-background">
      <CourseHeader session={session} isAdmin={isAdmin} onLogout={logout} active="modules" />
      <CurriculumView />
    </div>
  );
}
