"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h2 className="font-serif text-2xl font-bold text-primary">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load that page. Please try again, or head back to the course.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go home
        </Button>
      </div>
    </div>
  );
}
