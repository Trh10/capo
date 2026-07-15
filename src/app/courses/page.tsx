import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseSearch } from "@/components/courses/CourseSearch";

interface CoursesPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { q, category } = await searchParams;

  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where: {
        isPublished: true,
        ...(q && {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        }),
        ...(category && { category: { slug: category } }),
      },
      include: {
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        category: { select: { name: true, slug: true } },
        _count: { select: { lessons: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Tous les cours</h1>
      <p className="mt-2 text-muted">
        {courses.length} cours disponible{courses.length > 1 ? "s" : ""}
      </p>

      <CourseSearch
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
        initialQuery={q}
        initialCategory={category}
      />

      {courses.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              slug={course.slug}
              title={course.title}
              thumbnailUrl={course.thumbnailUrl}
              price={course.price}
              level={course.level}
              teacherName={`${course.teacher.user.firstName} ${course.teacher.user.lastName}`}
              lessonCount={course._count.lessons}
              categoryName={course.category?.name}
              durationMin={course.duration}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted">
          Aucun cours trouvé. Essayez une autre recherche.
        </p>
      )}
    </div>
  );
}
