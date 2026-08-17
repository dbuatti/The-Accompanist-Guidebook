"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export default function SessionRedirect() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/modules");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center bg-background" />;
  }

  if (session) return null;

  return null;
}
