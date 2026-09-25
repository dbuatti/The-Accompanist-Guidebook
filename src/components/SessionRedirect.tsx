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

  // Render nothing: a placeholder here used to push the whole page down by a
  // full screen height while the session check was in flight.
  return null;
}
