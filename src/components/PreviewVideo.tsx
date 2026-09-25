"use client";

import VideoPlayer from "@/components/VideoPlayer";

// Public preview player: no progress tracking, nothing to save.
export default function PreviewVideo({ url }: { url: string }) {
  return <VideoPlayer url={url} onComplete={() => {}} />;
}
