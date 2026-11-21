"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LessonView from "@/components/course/LessonView";
import { useCourse } from "@/components/course/CourseProvider";

export default function LessonPage() {
  const { moduleSlug, lessonSlug } = useParams<{ moduleSlug: string; lessonSlug: string }>();
  const { session, isAdmin, isPaid, isLoading } = useCourse();
  const router = useRouter();

  // Non-paid, non-admin learners hit the paywall.
  useEffect(() => {
    if (isLoading || !session) return;
    if (!isAdmin && !isPaid) {
      router.replace("/welcome");
    }
  }, [session, isAdmin, isPaid, isLoading, router]);

  return <LessonView moduleSlug={moduleSlug} lessonSlug={lessonSlug} />;
}
