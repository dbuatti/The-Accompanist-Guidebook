"use client";

import { useEffect, useState } from "react";

interface VideoPlayerProps {
  url: string;
  onComplete: () => void;
}

const VideoPlayer = ({ url, onComplete }: VideoPlayerProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper to extract YouTube ID from various URL formats
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(url);

  if (!isMounted) {
    return (
      <div className="aspect-video w-full bg-black rounded-xl" />
    );
  }

  if (!videoId) {
    return (
      <div className="aspect-video w-full bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
        <p className="text-muted-foreground font-serif italic">Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-2xl bg-black ring-1 ring-white/10">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`}
        title="YouTube video player"
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;