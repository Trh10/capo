"use client";

import { WatchLessonExtras } from "@/components/offline/WatchLessonExtras";

interface LessonInfo {
  id: string;
  slug: string;
  title: string;
  contentType: string;
  videoUrl: string | null;
  isFree: boolean;
}

interface CourseOfflinePanelProps {
  courseSlug: string;
  lessons: LessonInfo[];
  hasCourseAccess: boolean;
  isLoggedIn: boolean;
}

export function CourseOfflinePanel({
  courseSlug,
  lessons,
  hasCourseAccess,
  isLoggedIn,
}: CourseOfflinePanelProps) {
  if (!isLoggedIn) return null;

  const downloadable = lessons.filter((l) => l.videoUrl);

  if (downloadable.length === 0) return null;

  if (!hasCourseAccess) {
    return (
      <div className="mt-4 border-2 border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary-deep">
          Hors ligne
        </p>
        <p className="mt-2 text-sm text-muted">
          Téléchargez les leçons sur votre appareil après achat du cours (1 appareil
          par leçon).
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 border-2 border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary-deep">
        Téléchargement hors ligne
      </p>
      <p className="mt-1 text-sm text-muted">
        Enregistrez une leçon sur cet appareil pour la regarder sans connexion.
      </p>
      <ul className="mt-4 space-y-4">
        {downloadable.map((lesson) => (
          <li key={lesson.id} className="border-t border-border-soft pt-4 first:border-t-0 first:pt-0">
            <p className="mb-2 text-sm font-medium">{lesson.title}</p>
            <WatchLessonExtras
              lessonId={lesson.id}
              courseSlug={courseSlug}
              lessonSlug={lesson.slug}
              lessonTitle={lesson.title}
              contentType={lesson.contentType}
              hasAccess
              hasVideo
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
