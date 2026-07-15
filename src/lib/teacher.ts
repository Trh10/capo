import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";
import { prisma } from "./prisma";

export async function getTeacherContext() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") return null;

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
  });

  if (!teacher) return null;

  return { user, teacher };
}

export async function requireTeacher() {
  const context = await getTeacherContext();
  if (!context) redirect("/login?redirect=/teacher");
  return context;
}

export async function getOwnedCourse(courseId: string, teacherId: string) {
  return prisma.course.findFirst({
    where: { id: courseId, teacherId },
    include: {
      category: { select: { id: true, name: true } },
      lessons: { orderBy: { order: "asc" } },
      _count: { select: { purchases: true } },
    },
  });
}

export async function syncCourseDuration(courseId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    select: { duration: true },
  });

  const totalMinutes = Math.max(
    1,
    Math.round(lessons.reduce((sum, lesson) => sum + lesson.duration, 0) / 60)
  );

  await prisma.course.update({
    where: { id: courseId },
    data: { duration: totalMinutes },
  });
}
