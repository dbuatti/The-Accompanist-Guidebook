"use client";

import { useParams } from "next/navigation";
import ModuleView from "@/components/course/ModuleView";

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  return <ModuleView moduleId={moduleId} />;
}
