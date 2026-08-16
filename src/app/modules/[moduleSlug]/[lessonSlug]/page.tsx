"use client";

import { useParams } from "next/navigation";
import LessonView from "@/components/course/LessonView";

export default function LessonPage() {
  const { moduleSlug, lessonSlug } = useParams<{ moduleSlug: string; lessonSlug: string }>();
  return <LessonView moduleSlug={moduleSlug} lessonSlug={lessonSlug} />;
}
