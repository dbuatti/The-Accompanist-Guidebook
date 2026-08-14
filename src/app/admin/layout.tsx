import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  if (!isAdmin(user.email)) redirect("/modules");
  return (
    <div className="min-h-screen bg-background w-full px-6 sm:px-8 lg:px-10 py-8">
      <AdminNav />
      {children}
    </div>
  );
}
