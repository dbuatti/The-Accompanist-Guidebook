"use client";

import ReactPlayer from "react-player/youtube";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  url: string;
  onComplete: () => void;
}

const VideoPlayer = ({ url, onComplete }: VideoPlayerProps) => {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg bg-black">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls
        onEnded={onComplete}
        config={{
          youtube: {
            playerVars: { showinfo: 0, rel: 0 }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;