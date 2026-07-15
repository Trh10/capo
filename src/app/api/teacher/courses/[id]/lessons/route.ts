import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueLessonSlug } from "@/lib/slug";
import {
  getOwnedCourse,
  getTeacherContext,
  syncCourseDuration,
} from "@/lib/teacher";
import { createLessonSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const context = await getTeacherContext();
  if (!context) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const course = await getOwnedCourse(id, context.teacher.id);

  if (!course) {
    return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = createLessonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const maxOrder = course.lessons.reduce(
      (max, lesson) => Math.max(max, lesson.order),
      0
    );
    const slug = await uniqueLessonSlug(course.id, data.title);

    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        slug,
        contentType: data.contentType ?? "VIDEO",
        videoUrl: data.videoUrl || null,
        duration: Math.round(data.durationMin * 60),
        isFree: data.isFree ?? false,
        order: maxOrder + 1,
        courseId: course.id,
      },
    });

    await syncCourseDuration(course.id);

    return NextResponse.json({ lesson }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de la leçon" },
      { status: 500 }
    );
  }
}
