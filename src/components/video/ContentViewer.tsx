"use client";

import Link from "next/link";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { getContentTypeLabel, isVideoContent } from "@/lib/content-types";

interface ContentViewerProps {
  contentType: string;
  contentUrl: string;
  title: string;
  maxWatchSeconds?: number | null;
  courseSlug: string;
  courseId?: string;
  teacherUserId?: string;
  teacherName?: string;
  isLoggedIn?: boolean;
  posterUrl?: string | null;
  lessonId?: string;
  initialWatchedSec?: number;
}

export function ContentViewer({
  contentType,
  contentUrl,
  title,
  maxWatchSeconds = null,
  courseSlug,
  courseId,
  teacherUserId,
  teacherName,
  isLoggedIn = false,
  posterUrl,
  lessonId,
  initialWatchedSec = 0,
}: ContentViewerProps) {
  if (isVideoContent(contentType)) {
    return (
      <VideoPlayer
        videoUrl={contentUrl}
        title={title}
        maxWatchSeconds={maxWatchSeconds}
        courseSlug={courseSlug}
        courseId={courseId}
        teacherUserId={teacherUserId}
        teacherName={teacherName}
        isLoggedIn={isLoggedIn}
        posterUrl={posterUrl}
        lessonId={lessonId}
        initialWatchedSec={initialWatchedSec}
      />
    );
  }

  const isPdf = contentUrl.toLowerCase().includes(".pdf");
  const label = getContentTypeLabel(contentType);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border bg-background px-4 py-3">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{title}</p>
      </div>

      {isPdf ? (
        <iframe
          src={contentUrl}
          title={title}
          className="aspect-[4/3] w-full bg-white"
        />
      ) : contentType === "AUDIO" ? (
        <div className="flex flex-col items-center justify-center gap-4 p-10">
          <audio controls src={contentUrl} className="w-full max-w-lg">
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl">
            📄
          </div>
          <p className="font-medium">{label} disponible</p>
          <Link
            href={contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Ouvrir / Télécharger
          </Link>
        </div>
      )}
    </div>
  );
}
