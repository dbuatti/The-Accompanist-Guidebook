import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  if (!isAdmin(user.email)) redirect("/modules");
  return <>{children}</>;
}
