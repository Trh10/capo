import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MediaImage } from "@/components/media/MediaImage";

export default async function MyCoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/my-courses");

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id, status: "COMPLETED" },
    include: {
      course: {
        select: {
          slug: true,
          title: true,
          thumbnailUrl: true,
          lessons: { select: { id: true } },
        },
      },
    },
    orderBy: { purchasedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Mes cours</h1>
      <p className="mt-2 text-muted">Reprenez là où vous vous êtes arrêté.</p>

      {purchases.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-muted">Vous n&apos;avez pas encore de cours.</p>
          <Link
            href="/courses"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Découvrir le catalogue →
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {purchases.map(({ course }) => (
            <Link
              key={course.slug}
              href={`/watch/${course.slug}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/30"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary/10">
                {course.thumbnailUrl && (
                  <MediaImage
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </div>
              <div>
                <p className="font-medium">{course.title}</p>
                <p className="text-sm text-muted">
                  {course.lessons.length} leçons · Continuer →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
