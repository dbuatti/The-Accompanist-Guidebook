import { redirect } from "next/navigation";

// The Tree manager was merged into the unified Curriculum editor at /admin.
export default function AdminTreeRedirect() {
  redirect("/admin");
}
