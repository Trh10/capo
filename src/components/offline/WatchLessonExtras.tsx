"use client";

import { useEffect, useState } from "react";
import { OfflineDownloadButton } from "@/components/offline/OfflineDownloadButton";
import { deviceRequestHeaders } from "@/lib/offline-storage";

interface WatchLessonExtrasProps {
  lessonId: string;
  courseSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  contentType: string;
  hasAccess: boolean;
  hasVideo: boolean;
}

export function WatchLessonExtras({
  lessonId,
  courseSlug,
  lessonSlug,
  lessonTitle,
  contentType,
  hasAccess,
  hasVideo,
}: WatchLessonExtrasProps) {
  const [canDownload, setCanDownload] = useState(false);
  const [disabledReason, setDisabledReason] = useState<string | null>(null);

  useEffect(() => {
    if (!hasAccess || !hasVideo) return;

    void fetch(`/api/downloads/lessons/${lessonId}`, {
      headers: deviceRequestHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        setCanDownload(Boolean(data.canDownload));
        setDisabledReason(data.reason ?? null);
      })
      .catch(() => {
        setCanDownload(false);
      });
  }, [hasAccess, hasVideo, lessonId]);

  if (!hasAccess || !hasVideo) return null;

  return (
    <OfflineDownloadButton
      lessonId={lessonId}
      courseSlug={courseSlug}
      lessonSlug={lessonSlug}
      lessonTitle={lessonTitle}
      contentType={contentType}
      canDownload={canDownload}
      disabledReason={disabledReason}
    />
  );
}
