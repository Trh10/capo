"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getOfflineBlobUrl, getOfflineLesson } from "@/lib/offline-storage";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  maxWatchSeconds?: number | null;
  courseSlug: string;
  posterUrl?: string | null;
  lessonId?: string;
  initialWatchedSec?: number;
}

export function VideoPlayer({
  videoUrl,
  title,
  maxWatchSeconds = null,
  courseSlug,
  posterUrl,
  lessonId,
  initialWatchedSec = 0,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedRef = useRef(0);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [resumeApplied, setResumeApplied] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState(videoUrl);
  const isPreview = maxWatchSeconds !== null && maxWatchSeconds > 0;
  const canSaveProgress = Boolean(lessonId) && !isPreview;

  const saveProgress = useCallback(
    async (watchedSec: number) => {
      if (!canSaveProgress || !lessonId) return;

      await fetch(`/api/progress/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchedSec }),
      });
    },
    [canSaveProgress, lessonId]
  );

  const blockPreview = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPreview && !previewEnded && video.currentTime >= maxWatchSeconds!) {
      video.pause();
      video.currentTime = maxWatchSeconds!;
      setPreviewEnded(true);
      return;
    }

    if (
      canSaveProgress &&
      video.currentTime - lastSavedRef.current >= 10
    ) {
      lastSavedRef.current = video.currentTime;
      void saveProgress(Math.floor(video.currentTime));
    }
  }, [isPreview, maxWatchSeconds, previewEnded, canSaveProgress, saveProgress]);

  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isPreview || previewEnded) return;

    if (video.currentTime > maxWatchSeconds!) {
      video.currentTime = maxWatchSeconds!;
    }
  }, [isPreview, maxWatchSeconds, previewEnded]);

  const handlePlay = useCallback(() => {
    if (previewEnded) {
      videoRef.current?.pause();
    }
  }, [previewEnded]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || resumeApplied || isPreview || initialWatchedSec <= 0) return;

    video.currentTime = initialWatchedSec;
    lastSavedRef.current = initialWatchedSec;
    setResumeApplied(true);
  }, [initialWatchedSec, isPreview, resumeApplied]);

  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lessonId || isPreview) {
      setPlaybackUrl(videoUrl);
      return;
    }

    void getOfflineLesson(lessonId).then((record) => {
      if (record) {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = getOfflineBlobUrl(record);
        setPlaybackUrl(blobUrlRef.current);
      } else {
        setPlaybackUrl(videoUrl);
      }
    });

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [isPreview, lessonId, videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (canSaveProgress && video && video.currentTime > 0) {
        void saveProgress(Math.floor(video.currentTime));
      }
    };
  }, [canSaveProgress, saveProgress]);

  return (
    <div className="relative aspect-video overflow-hidden border-2 border-border bg-black">
      <video
        ref={videoRef}
        src={playbackUrl}
        poster={posterUrl ?? undefined}
        controls
        playsInline
        className="h-full w-full"
        onTimeUpdate={blockPreview}
        onSeeking={handleSeeking}
        onPlay={handlePlay}
        onLoadedMetadata={handleLoadedMetadata}
        aria-label={title}
      />

      {canSaveProgress && initialWatchedSec > 0 && !resumeApplied && (
        <div className="pointer-events-none absolute right-4 top-4 rounded-md bg-black/70 px-3 py-1 text-xs text-white backdrop-blur-sm">
          Reprise à {Math.floor(initialWatchedSec / 60)}:
          {(initialWatchedSec % 60).toString().padStart(2, "0")}
        </div>
      )}

      {isPreview && !previewEnded && (
        <>
          <div className="pointer-events-none absolute left-4 top-4 rounded-md bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Aperçu gratuit · 1 min
          </div>
          <div className="absolute inset-x-0 bottom-12 flex items-center justify-between gap-3 px-4 sm:bottom-14">
            <p className="pointer-events-none rounded-lg bg-black/75 px-3 py-2 text-xs text-white/90 backdrop-blur-sm sm:text-sm">
              Vous regardez un extrait. Achetez le cours pour voir la suite.
            </p>
            <Link
              href={`/courses/${courseSlug}`}
              className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-primary-dark sm:text-sm"
            >
              Acheter le cours
            </Link>
          </div>
        </>
      )}

      {previewEnded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 px-6 text-center text-white">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <p className="text-xl font-semibold">Vous aimez ce cours ?</p>
          <p className="mt-2 max-w-md text-sm text-white/70">
            Votre aperçu gratuit est terminé. Achetez le cours pour débloquer
            toutes les leçons et continuer votre apprentissage.
          </p>
          <Link
            href={`/courses/${courseSlug}`}
            className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Voir et acheter le cours
          </Link>
        </div>
      )}
    </div>
  );
}
