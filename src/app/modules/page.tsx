"use client";

import { useCourse } from "@/components/course/CourseProvider";
import CurriculumView from "@/components/course/CurriculumView";

export default function ModulesPage() {
  const { content } = useCourse();
  return <CurriculumView content={content} />;
}
