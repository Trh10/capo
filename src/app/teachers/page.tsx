import Link from "next/link";
import { MediaImage } from "@/components/media/MediaImage";
import { prisma } from "@/lib/prisma";

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      _count: { select: { courses: true } },
    },
    orderBy: { user: { firstName: "asc" } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Nos professeurs</h1>
      <p className="mt-2 text-muted">
        Découvrez les artisans et créateurs qui partagent leur savoir-faire.
      </p>

      {teachers.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Link
              key={teacher.id}
              href={`/teachers/${teacher.user.id}`}
              className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-lg"
            >
              {teacher.user.avatarUrl ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-full">
                  <MediaImage
                    src={teacher.user.avatarUrl}
                    alt={`${teacher.user.firstName} ${teacher.user.lastName}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-2xl font-bold text-secondary">
                  {teacher.user.firstName[0]}
                  {teacher.user.lastName[0]}
                </div>
              )}
              <h3 className="mt-4 text-lg font-semibold">
                {teacher.user.firstName} {teacher.user.lastName}
              </h3>
              {teacher.specialty && (
                <p className="mt-1 text-sm text-primary">{teacher.specialty}</p>
              )}
              {teacher.bio && (
                <p className="mt-2 line-clamp-3 text-sm text-muted">
                  {teacher.bio}
                </p>
              )}
              <p className="mt-4 text-xs text-muted">
                {teacher._count.courses} cours
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted">
          Aucun professeur pour le moment.
        </p>
      )}
    </div>
  );
}
