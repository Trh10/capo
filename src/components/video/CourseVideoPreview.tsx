"use client";

import { useState } from "react";
import { MediaImage } from "@/components/media/MediaImage";
import { VideoPlayer } from "./VideoPlayer";

interface CourseVideoPreviewProps {
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  duration: string;
  videoUrl?: string | null;
  maxWatchSeconds?: number | null;
}

export function CourseVideoPreview({
  slug,
  title,
  thumbnailUrl,
  duration,
  videoUrl,
  maxWatchSeconds = null,
}: CourseVideoPreviewProps) {
  const [playing, setPlaying] = useState(false);

  if (playing && videoUrl) {
    return (
      <VideoPlayer
        videoUrl={videoUrl}
        title={title}
        maxWatchSeconds={maxWatchSeconds}
        courseSlug={slug}
        posterUrl={thumbnailUrl}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block w-full overflow-hidden rounded-2xl text-left"
      aria-label={`Lire l'aperçu : ${title}`}
    >
      <div className="relative aspect-video bg-gradient-to-br from-secondary/20 to-accent/20">
        {thumbnailUrl && (
          <MediaImage
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-xl transition group-hover:scale-110 sm:h-20 sm:w-20">
            <svg className="ml-1 h-8 w-8 sm:h-9 sm:w-9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <span className="absolute bottom-4 left-4 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-white">
          {maxWatchSeconds ? "Aperçu · 1 min" : "Aperçu gratuit"}
        </span>
        <span className="absolute bottom-4 right-4 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white">
          {duration}
        </span>
      </div>
    </button>
  );
}
