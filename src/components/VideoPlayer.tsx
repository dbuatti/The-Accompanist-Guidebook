"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  url: string;
  onComplete: () => void;
  initialTime?: number;
  onProgress?: (seconds: number) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const VideoPlayer = ({ url, onComplete, initialTime = 0, onProgress }: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(url);

  useEffect(() => {
    if (!videoId) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsApiLoaded(true);
      };
    } else {
      setIsApiLoaded(true);
    }
  }, [videoId]);

  useEffect(() => {
    if (isApiLoaded && videoId && iframeRef.current) {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event: any) => {
            if (event.data === 0) { // 0 is ENDED
              onComplete();
            }
          },
          onReady: (event: any) => {
            if (initialTime > 0) {
              event.target.seekTo(initialTime, true);
            }
          }
        }
      });

      const interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime && onProgress) {
          onProgress(Math.floor(playerRef.current.getCurrentTime()));
        }
      }, 5000);

      return () => {
        clearInterval(interval);
        if (playerRef.current) {
          playerRef.current.destroy();
        }
      };
    }
  }, [isApiLoaded, videoId, onComplete, initialTime, onProgress]);

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
        ref={iframeRef}
        id="yt-player"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`}
        title="YouTube video player"
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;