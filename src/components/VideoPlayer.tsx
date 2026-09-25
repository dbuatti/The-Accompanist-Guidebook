"use client";

import { useEffect, useId, useRef, useState } from "react";

interface VideoPlayerProps {
  url: string;
  onComplete: () => void;
  initialTime?: number;
  onProgress?: (seconds: number) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

// Load the YouTube IFrame API exactly once, however many players mount.
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    });
  }
  return ytApiPromise;
}

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const VideoPlayer = ({ url, onComplete, initialTime = 0, onProgress }: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const playerDomId = useId();
  const videoId = getYoutubeId(url);

  // Callbacks live in refs so a parent re-render (e.g. marking the lesson
  // complete) never tears down and rebuilds the player mid-playback.
  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);
  const initialTimeRef = useRef(initialTime);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onProgressRef.current = onProgress;
  });

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (!cancelled) setIsApiLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    if (!isApiLoaded || !videoId || !iframeRef.current) return;

    const player = new window.YT.Player(iframeRef.current, {
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED) onCompleteRef.current();
        },
        onReady: (event: any) => {
          if (initialTimeRef.current > 5) event.target.seekTo(initialTimeRef.current, true);
        },
      },
    });
    playerRef.current = player;

    const interval = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime || !p?.getPlayerState) return;
      // Only report while actually playing, so pausing doesn't spam saves.
      if (p.getPlayerState() === window.YT.PlayerState.PLAYING) {
        onProgressRef.current?.(Math.floor(p.getCurrentTime()));
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      playerRef.current = null;
      // Don't call player.destroy(): it removes the iframe React owns, which
      // leaves the next render with a detached node and a blank video.
    };
  }, [isApiLoaded, videoId]);

  if (!videoId) {
    return (
      <div className="aspect-video w-full bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
        <p className="text-muted-foreground font-serif italic">This video isn&apos;t available right now.</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-2xl bg-black ring-1 ring-white/10">
      <iframe
        key={videoId}
        ref={iframeRef}
        id={playerDomId}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
        title="Lesson video"
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;
