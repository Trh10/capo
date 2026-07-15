import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import {
  getMaxWatchSeconds,
  hasPurchasedCourse,
} from "@/lib/course-access";
import { confirmCheckoutSession } from "@/lib/stripe-checkout";
import { CourseVideoPreview } from "@/components/video/CourseVideoPreview";
import { LessonVideoItem } from "@/components/video/LessonVideoItem";
import { BuyCourseButton } from "@/components/courses/BuyCourseButton";
import { PurchaseBanner } from "@/components/courses/PurchaseBanner";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ purchased?: string; cancelled?: string; session_id?: string }>;
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: CoursePageProps) {
  const { slug } = await params;
  const { purchased, cancelled, session_id } = await searchParams;
  const user = await getCurrentUser();

  const course = await prisma.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
      category: true,
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!course) notFound();

  if (session_id && user) {
    await confirmCheckoutSession(session_id, user.id);
  }

  const hasPurchased = await hasPurchasedCourse(user?.id, course.id);
  const formattedPrice = formatPrice(course.price);
  const totalDuration = Math.round(
    course.lessons.reduce((sum, l) => sum + l.duration, 0) / 60
  );
  const previewLesson = course.lessons.find((l) => l.isFree) || course.lessons[0];
  const durationLabel =
    totalDuration >= 60
      ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}min`
      : `${totalDuration} min`;
  const previewMaxWatchSeconds = previewLesson
    ? getMaxWatchSeconds(hasPurchased, previewLesson.isFree)
    : null;
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <PurchaseBanner
        purchased={purchased === "1"}
        cancelled={cancelled === "1"}
      />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CourseVideoPreview
            slug={course.slug}
            title={course.title}
            thumbnailUrl={course.thumbnailUrl}
            duration={durationLabel}
            videoUrl={previewLesson?.videoUrl}
            maxWatchSeconds={previewMaxWatchSeconds}
          />

          <h1 className="mt-6 text-2xl font-bold sm:mt-8 sm:text-3xl">{course.title}</h1>
          <p className="mt-4 leading-relaxed text-muted">{course.description}</p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-border bg-card px-3 py-1">
              {course.level}
            </span>
            <span className="rounded-full border border-border bg-card px-3 py-1">
              {course.lessons.length} leçons
            </span>
            <span className="rounded-full border border-border bg-card px-3 py-1">
              {totalDuration} min
            </span>
            {course.category && (
              <span className="rounded-full border border-border bg-card px-3 py-1">
                {course.category.name}
              </span>
            )}
          </div>

          <h2 className="mt-10 text-xl font-semibold">Contenu du cours</h2>
          <div className="mt-4 space-y-3">
            {course.lessons.map((lesson, i) => (
              <LessonVideoItem
                key={lesson.id}
                index={i + 1}
                title={lesson.title}
                durationMin={Math.max(1, Math.floor(lesson.duration / 60))}
                isFree={lesson.isFree}
                courseSlug={course.slug}
                lessonSlug={lesson.slug}
                thumbnailUrl={course.thumbnailUrl}
                locked={!hasPurchased && !lesson.isFree}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <p className="text-3xl font-bold text-primary">{formattedPrice}</p>

            {hasPurchased ? (
              <Link
                href={`/watch/${course.slug}`}
                className="mt-4 block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Continuer le cours
              </Link>
            ) : (
              <BuyCourseButton
                courseSlug={course.slug}
                isLoggedIn={Boolean(user)}
              />
            )}

            <p className="mt-2 text-center text-xs text-muted">
              {stripeConfigured
                ? "Paiement sécurisé par Stripe"
                : "Mode démo — achat simulé en local"}
            </p>

            <hr className="my-6 border-border" />

            <Link
              href={`/teachers/${course.teacher.user.id}`}
              className="flex items-center gap-3 transition hover:opacity-80"
            >
              {course.teacher.user.avatarUrl ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={course.teacher.user.avatarUrl}
                    alt={`${course.teacher.user.firstName} ${course.teacher.user.lastName}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-lg font-bold text-secondary">
                  {course.teacher.user.firstName[0]}
                  {course.teacher.user.lastName[0]}
                </div>
              )}
              <div>
                <p className="font-medium">
                  {course.teacher.user.firstName} {course.teacher.user.lastName}
                </p>
                <p className="text-sm text-muted">Professeur</p>
              </div>
            </Link>

            {course.teacher.bio && (
              <p className="mt-4 text-sm text-muted">{course.teacher.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
