"use client";

import { useParams, useRouter } from "next/navigation";
import { AccountView } from "@neondatabase/auth/react";
import { authClient } from "@/lib/auth/client";
import { ADMIN_EMAILS } from "@/lib/admin";
import CourseHeader from "@/components/course/CourseHeader";

export default function AccountPage() {
  const { path } = useParams<{ path: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAdmin = !!(session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase()));

  const logout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <CourseHeader session={session} isAdmin={isAdmin} onLogout={logout} active="account" />
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        <AccountView path={path} />
      </main>
    </div>
  );
}
