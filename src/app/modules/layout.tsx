"use client";

import { CourseProvider } from "@/components/course/CourseProvider";
import CourseShell from "@/components/course/CourseShell";

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return (
    <CourseProvider>
      <CourseShell>{children}</CourseShell>
    </CourseProvider>
  );
}
