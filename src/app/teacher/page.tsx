import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacher";
import { formatPrice } from "@/lib/format";
import { MediaImage } from "@/components/media/MediaImage";

export default async function TeacherDashboardPage() {
  const { user, teacher } = await requireTeacher();

  const courses = await prisma.course.findMany({
    where: { teacherId: teacher.id },
    include: {
      _count: { select: { lessons: true, purchases: true } },
      purchases: {
        where: { status: "COMPLETED" },
        select: { amount: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalSales = courses.reduce(
    (sum, course) => sum + course.purchases.length,
    0
  );
  const totalRevenue = courses.reduce(
    (sum, course) =>
      sum + course.purchases.reduce((s, p) => s + p.amount, 0),
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Espace professeur</h1>
          <p className="mt-2 text-muted">
            Bonjour {user.firstName}, créez et vendez vos contenus.
          </p>
        </div>
        <Link
          href="/teacher/courses/new"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          + Nouveau cours
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold text-primary">{courses.length}</p>
          <p className="mt-1 text-sm text-muted">Cours créés</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold text-primary">{totalSales}</p>
          <p className="mt-1 text-sm text-muted">Ventes totales</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-bold text-primary">
            {formatPrice(totalRevenue)}
          </p>
          <p className="mt-1 text-sm text-muted">Revenus</p>
        </div>
      </div>

      <p className="mt-6 rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <strong>Comment ça marche ?</strong> 1) Créez le cours (titre, prix,
        miniature…) → 2) Cliquez <strong>Gérer</strong> pour uploader vidéos,
        livres et syllabus.
      </p>

      {courses.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-muted">Vous n&apos;avez pas encore créé de cours.</p>
          <Link
            href="/teacher/courses/new"
            className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Créer votre premier cours
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Mes cours</h2>
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
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
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{course.title}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      course.isPublished
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {course.isPublished ? "Publié" : "Brouillon"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatPrice(course.price)} · {course._count.lessons} contenu
                  {course._count.lessons > 1 ? "s" : ""} · {course._count.purchases}{" "}
                  achat{course._count.purchases > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {course.isPublished && (
                  <Link
                    href={`/courses/${course.slug}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm transition hover:border-primary"
                  >
                    Voir
                  </Link>
                )}
                <Link
                  href={`/teacher/courses/${course.id}/edit`}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white"
                >
                  Gérer → upload
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
