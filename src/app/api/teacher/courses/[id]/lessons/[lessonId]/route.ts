import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueLessonSlug } from "@/lib/slug";
import {
  getOwnedCourse,
  getTeacherContext,
  syncCourseDuration,
} from "@/lib/teacher";
import { updateLessonSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string; lessonId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const context = await getTeacherContext();
  if (!context) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id, lessonId } = await params;
  const course = await getOwnedCourse(id, context.teacher.id);

  if (!course) {
    return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
  }

  const lesson = course.lessons.find((item) => item.id === lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Leçon introuvable" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = updateLessonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.direction) {
      const sorted = [...course.lessons].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((item) => item.id === lessonId);
      const swapIndex = data.direction === "up" ? index - 1 : index + 1;

      if (swapIndex >= 0 && swapIndex < sorted.length) {
        const current = sorted[index];
        const target = sorted[swapIndex];

        await prisma.$transaction([
          prisma.lesson.update({
            where: { id: current.id },
            data: { order: target.order },
          }),
          prisma.lesson.update({
            where: { id: target.id },
            data: { order: current.order },
          }),
        ]);
      }

      const lessons = await prisma.lesson.findMany({
        where: { courseId: course.id },
        orderBy: { order: "asc" },
      });

      return NextResponse.json({ lessons });
    }

    let slug = lesson.slug;
    if (data.title && data.title !== lesson.title) {
      slug = await uniqueLessonSlug(course.id, data.title, lesson.id);
    }

    const updated = await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        ...(data.title !== undefined && { title: data.title, slug }),
        ...(data.contentType !== undefined && { contentType: data.contentType }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl || null }),
        ...(data.durationMin !== undefined && {
          duration: Math.round(data.durationMin * 60),
        }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
      },
    });

    await syncCourseDuration(course.id);

    return NextResponse.json({ lesson: updated });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const context = await getTeacherContext();
  if (!context) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id, lessonId } = await params;
  const course = await getOwnedCourse(id, context.teacher.id);

  if (!course) {
    return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
  }

  const lesson = course.lessons.find((item) => item.id === lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Leçon introuvable" }, { status: 404 });
  }

  await prisma.lesson.delete({ where: { id: lesson.id } });
  await syncCourseDuration(course.id);

  return NextResponse.json({ success: true });
}
