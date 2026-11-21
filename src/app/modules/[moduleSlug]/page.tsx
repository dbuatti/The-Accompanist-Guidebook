"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ModuleView from "@/components/course/ModuleView";
import { useCourse } from "@/components/course/CourseProvider";

export default function ModulePage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const { session, isAdmin, isPaid, isLoading } = useCourse();
  const router = useRouter();

  // Non-paid, non-admin learners hit the paywall.
  useEffect(() => {
    if (isLoading || !session) return;
    if (!isAdmin && !isPaid) {
      router.replace("/welcome");
    }
  }, [session, isAdmin, isPaid, isLoading, router]);

  return <ModuleView moduleSlug={moduleSlug} />;
}
