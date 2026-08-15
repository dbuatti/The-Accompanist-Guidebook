"use client";

import { useParams } from "next/navigation";
import LessonView from "@/components/course/LessonView";

export default function LessonPage() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  return <LessonView moduleId={moduleId} lessonId={lessonId} />;
}
