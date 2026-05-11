"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  url: string;
  onComplete: () => void;
}

const VideoPlayer = ({ url, onComplete }: VideoPlayerProps) => {
  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  if (!hasWindow) return <div className="aspect-video w-full bg-black rounded-xl" />;

  // Cast to any to bypass the library's internal type mismatch with React 19
  const Player = ReactPlayer as any;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg bg-black">
      <Player
        url={url}
        width="100%"
        height="100%"
        controls
        onEnded={onComplete}
        config={{
          youtube: {
            playerVars: { rel: 0 }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;