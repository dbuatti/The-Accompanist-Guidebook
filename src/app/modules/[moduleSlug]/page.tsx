"use client";

import { useParams } from "next/navigation";
import ModuleView from "@/components/course/ModuleView";

export default function ModulePage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  return <ModuleView moduleSlug={moduleSlug} />;
}
