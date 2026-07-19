"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deviceRequestHeaders,
  getOfflineLesson,
  saveOfflineLesson,
} from "@/lib/offline-storage";

interface OfflineDownloadButtonProps {
  lessonId: string;
  courseSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  contentType: string;
  canDownload: boolean;
  disabledReason?: string | null;
}

type DownloadState = "idle" | "loading" | "saved" | "error";

export function OfflineDownloadButton({
  lessonId,
  courseSlug,
  lessonSlug,
  lessonTitle,
  contentType,
  canDownload,
  disabledReason,
}: OfflineDownloadButtonProps) {
  const [state, setState] = useState<DownloadState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getOfflineLesson(lessonId).then((record) => {
      if (!cancelled && record) setState("saved");
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const handleDownload = useCallback(async () => {
    if (!canDownload || state === "loading" || state === "saved") return;

    setState("loading");
    setMessage(null);

    try {
      const res = await fetch(`/api/downloads/lessons/${lessonId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...deviceRequestHeaders(),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Téléchargement impossible");
      }

      const downloadUrl = data.downloadUrl as string;
      const fileRes = await fetch(downloadUrl, { credentials: "include" });
      if (!fileRes.ok) {
        throw new Error("Impossible de récupérer le fichier");
      }

      const blob = await fileRes.blob();
      await saveOfflineLesson({
        lessonId,
        courseSlug,
        lessonSlug,
        title: lessonTitle,
        contentType,
        mimeType: blob.type || "application/octet-stream",
        savedAt: new Date().toISOString(),
        blob,
      });

      setState("saved");
      setMessage("Disponible hors ligne sur cet appareil");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Erreur de téléchargement");
    }
  }, [canDownload, contentType, courseSlug, lessonId, lessonSlug, lessonTitle, state]);

  if (!canDownload && !disabledReason) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={!canDownload || state === "loading" || state === "saved"}
        className="inline-flex items-center justify-start gap-2 border-2 border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "loading" && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
        {state === "saved"
          ? "✓ Téléchargé hors ligne"
          : state === "loading"
            ? "Téléchargement…"
            : "Télécharger hors ligne"}
      </button>
      {disabledReason && state !== "saved" && (
        <p className="text-xs leading-relaxed text-muted">{disabledReason}</p>
      )}
      {message && (
        <p
          className={`text-xs ${state === "error" ? "text-primary" : "text-muted"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
