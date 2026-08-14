import { redirect } from "next/navigation";

// "Module Studio" was merged into the unified Curriculum editor at /admin.
export default function ModuleStudioRedirect() {
  redirect("/admin");
}
