import { redirect } from "next/navigation";

// The AI Assistant page was folded into the unified Curriculum editor at /admin
// (per-lesson "Generate with AI" / "Copy AI Prompt", and "Scaffold Curriculum" in the Tools menu).
export default function AdminAssistantRedirect() {
  redirect("/admin");
}
