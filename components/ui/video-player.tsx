"use client";

import Video from "next-video";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  isVertical?: boolean;
}

export function VideoPlayer({ src, poster, className, isVertical = true }: VideoPlayerProps) {
  return (
    <div className={`mx-auto ${isVertical ? 'max-w-[400px]' : 'w-full'}`}>
      <div className={isVertical ? 'aspect-[9/16]' : 'aspect-video'}>
        <Video
          src={src}
          poster={poster}
          className={`${className} h-full w-full`}
          controls
          style={{
            objectFit: "cover",
            borderRadius: "0.5rem",
          }}
        />
      </div>
    </div>
  );
}