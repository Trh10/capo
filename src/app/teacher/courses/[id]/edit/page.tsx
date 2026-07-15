import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOwnedCourse, requireTeacher } from "@/lib/teacher";
import { CourseForm } from "@/components/teacher/CourseForm";
import { LessonManager } from "@/components/teacher/LessonManager";
import { DeleteCourseButton } from "@/components/teacher/DeleteCourseButton";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}

export default async function EditCoursePage({
  params,
  searchParams,
}: EditCoursePageProps) {
  const { teacher } = await requireTeacher();
  const { id } = await params;
  const { step } = await searchParams;

  const course = await getOwnedCourse(id, teacher.id);
  if (!course) notFound();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/teacher"
        className="text-sm text-muted transition hover:text-primary"
      >
        ← Retour au tableau de bord
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="mt-2 text-muted">Gérer votre cours</p>
        </div>
        {course.isPublished && (
          <Link
            href={`/courses/${course.slug}`}
            className="rounded-lg border border-border px-4 py-2 text-sm transition hover:border-primary"
          >
            Voir la page publique
          </Link>
        )}
      </div>

      {step === "2" && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Cours créé ! <strong>Étape 2 :</strong> uploadez vos vidéos, livres
          et syllabus ci-dessous.
        </div>
      )}

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Informations du cours</h2>
        <div className="mt-4">
          <CourseForm
            mode="edit"
            courseId={course.id}
            categorySuggestions={categories.map((c) => c.name)}
            initial={{
              title: course.title,
              slug: course.slug,
              description: course.description,
              shortDesc: course.shortDesc,
              thumbnailUrl: course.thumbnailUrl,
              price: course.price,
              level: course.level,
              categoryName: course.category?.name ?? "",
              isPublished: course.isPublished,
            }}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border-2 border-primary/20 bg-card p-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-primary">Étape 2 — Contenus</p>
          <h2 className="text-lg font-semibold">
            Uploadez vos fichiers ({course.lessons.length})
          </h2>
          <p className="mt-1 text-sm text-muted">
            Vidéos, livres, syllabus, PDF, audio… jusqu&apos;à 5 Go par fichier.
          </p>
        </div>
        <LessonManager courseId={course.id} initialLessons={course.lessons} />
      </section>

      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="text-lg font-semibold text-red-700">Zone dangereuse</h2>
        <p className="mt-2 text-sm text-red-600/80">
          Supprimer définitivement ce cours et tout son contenu.
          {course._count.purchases > 0 &&
            ` Attention : ${course._count.purchases} achat(s) enregistré(s).`}
        </p>
        <DeleteCourseButton courseId={course.id} />
      </section>
    </div>
  );
}
