import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getMaxWatchSeconds,
  hasPurchasedCourse,
} from "@/lib/course-access";
import { ContentViewer } from "@/components/video/ContentViewer";
import { getContentTypeLabel, isVideoContent } from "@/lib/content-types";

interface WatchPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { slug } = await params;
  const { lesson: lessonSlug } = await searchParams;
  const user = await getCurrentUser();

  const course = await prisma.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      teacher: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!course) notFound();

  const hasPurchased = await hasPurchasedCourse(user?.id, course.id);

  const currentLesson =
    course.lessons.find((l) => l.slug === lessonSlug) ||
    course.lessons.find((l) => l.isFree) ||
    course.lessons[0];

  if (!currentLesson) notFound();

  const maxWatchSeconds = getMaxWatchSeconds(hasPurchased, currentLesson.isFree);
  const durationMin = Math.max(1, Math.floor(currentLesson.duration / 60));

  let initialWatchedSec = 0;
  if (user && maxWatchSeconds === null) {
    const progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: currentLesson.id,
        },
      },
    });
    initialWatchedSec = progress?.watchedSec ?? 0;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {currentLesson.videoUrl ? (
        <ContentViewer
          contentType={currentLesson.contentType}
          contentUrl={currentLesson.videoUrl}
          title={currentLesson.title}
          maxWatchSeconds={
            isVideoContent(currentLesson.contentType) ? maxWatchSeconds : null
          }
          courseSlug={course.slug}
          posterUrl={course.thumbnailUrl}
          lessonId={currentLesson.id}
          initialWatchedSec={initialWatchedSec}
        />
      ) : (
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
            <p className="text-xl font-semibold">{currentLesson.title}</p>
            <p className="mt-2 text-sm text-white/70">
              {getContentTypeLabel(currentLesson.contentType)} bientôt disponible
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {course.title} · {course.teacher.user.firstName}{" "}
            {course.teacher.user.lastName} · {durationMin} min
          </p>
          {maxWatchSeconds !== null && isVideoContent(currentLesson.contentType) && (
            <p className="mt-2 text-sm text-primary">
              Aperçu gratuit limité à 1 minute — achetez le cours pour voir la suite
            </p>
          )}
        </div>
        <Link
          href={`/courses/${course.slug}`}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
        >
          ← Retour au cours
        </Link>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Leçons</h2>
      <div className="mt-4 space-y-2">
        {course.lessons.map((lesson, i) => {
          const active = lesson.id === currentLesson.id;
          const locked = !hasPurchased && !lesson.isFree;

          return (
            <Link
              key={lesson.id}
              href={`/watch/${course.slug}?lesson=${lesson.slug}`}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  active ? "bg-primary text-white" : "bg-primary/10 text-primary"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {lesson.title}
              </span>
              {locked && <span className="text-xs text-muted">1 min</span>}
              <span className="text-xs text-muted">
                {Math.max(1, Math.floor(lesson.duration / 60))} min
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
