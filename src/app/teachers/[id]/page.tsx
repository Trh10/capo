import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MediaImage } from "@/components/media/MediaImage";
import { CourseCard } from "@/components/courses/CourseCard";

interface TeacherPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherDetailPage({ params }: TeacherPageProps) {
  const { id } = await params;

  const teacher = await prisma.teacher.findFirst({
    where: { user: { id } },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      courses: {
        where: { isPublished: true },
        include: {
          category: { select: { name: true } },
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  if (!teacher) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-start gap-6">
        {teacher.user.avatarUrl ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full">
            <MediaImage
              src={teacher.user.avatarUrl}
              alt={`${teacher.user.firstName} ${teacher.user.lastName}`}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-3xl font-bold text-secondary">
            {teacher.user.firstName[0]}
            {teacher.user.lastName[0]}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">
            {teacher.user.firstName} {teacher.user.lastName}
          </h1>
          {teacher.specialty && (
            <p className="mt-1 text-lg text-primary">{teacher.specialty}</p>
          )}
          {teacher.location && (
            <p className="mt-1 text-sm text-muted">{teacher.location}</p>
          )}
          {teacher.bio && (
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              {teacher.bio}
            </p>
          )}
        </div>
      </div>

      <h2 className="mt-12 text-2xl font-bold">
        Cours de {teacher.user.firstName}
      </h2>

      {teacher.courses.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teacher.courses.map((course) => (
            <CourseCard
              key={course.id}
              slug={course.slug}
              title={course.title}
              thumbnailUrl={course.thumbnailUrl}
              price={course.price}
              level={course.level}
              teacherName={`${teacher.user.firstName} ${teacher.user.lastName}`}
              lessonCount={course._count.lessons}
              categoryName={course.category?.name}
              durationMin={course.duration}
            />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-muted">Aucun cours publié pour le moment.</p>
      )}
    </div>
  );
}
