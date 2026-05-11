"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Use the main react-player entry point to resolve TypeScript module resolution issues
const ReactPlayer = dynamic(() => import("react-player").then(mod => mod.default), { 
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full bg-muted animate-pulse rounded-xl flex items-center justify-center">
      <div className="text-muted-foreground font-serif italic">Preparing the stage...</div>
    </div>
  )
}) as any;

interface VideoPlayerProps {
  url: string;
  onComplete: () => void;
}

const VideoPlayer = ({ url, onComplete }: VideoPlayerProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("VideoPlayer: Mounted with URL:", url);
  }, [url]);

  if (!isMounted) {
    return (
      <div className="aspect-video w-full bg-black rounded-xl" />
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-2xl bg-black ring-1 ring-white/10">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls
        onEnded={onComplete}
        onError={(e: any) => {
          console.error("VideoPlayer: Error loading video:", e);
        }}
        onReady={() => console.log("VideoPlayer: Player is ready")}
        config={{
          youtube: {
            playerVars: { 
              rel: 0,
              modestbranding: 1,
              autoplay: 0
            }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;