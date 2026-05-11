"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Use any for the dynamic component to bypass complex type mismatches between Next.js dynamic and react-player
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
  }, []);

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
        config={{
          youtube: {
            playerVars: { 
              rel: 0,
              modestbranding: 1,
              origin: typeof window !== 'undefined' ? window.location.origin : ''
            }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;