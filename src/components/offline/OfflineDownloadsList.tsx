"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listOfflineLessons, type OfflineLessonRecord } from "@/lib/offline-storage";

export function OfflineDownloadsList() {
  const [items, setItems] = useState<OfflineLessonRecord[]>([]);

  useEffect(() => {
    void listOfflineLessons().then(setItems);
  }, []);

  if (items.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">
        Aucun contenu hors ligne. Téléchargez une leçon depuis la page de lecture.
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li key={item.lessonId}>
          <Link
            href={`/watch/${item.courseSlug}?lesson=${encodeURIComponent(item.lessonSlug)}`}
            className="flex items-center justify-between border border-border-soft bg-background px-4 py-3 text-sm transition hover:border-primary/40"
          >
            <span className="font-medium">{item.title}</span>
            <span className="text-xs text-muted">Hors ligne</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
