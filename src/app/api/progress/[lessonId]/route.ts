import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canWatchLessonFully, hasPurchasedCourse } from "@/lib/course-access";
import { prisma } from "@/lib/prisma";
import { progressSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { lessonId } = await params;
    const body = await request.json();
    const parsed = progressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, isFree: true, courseId: true, duration: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Leçon introuvable" }, { status: 404 });
    }

    const hasPurchased = await hasPurchasedCourse(user.id, lesson.courseId);
    if (!canWatchLessonFully(hasPurchased, lesson.isFree)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const watchedSec = Math.min(
      Math.max(0, Math.floor(parsed.data.watchedSec)),
      lesson.duration || parsed.data.watchedSec
    );

    const completed =
      parsed.data.completed ??
      (lesson.duration > 0 && watchedSec >= lesson.duration * 0.9);

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId: user.id, lessonId },
      },
      create: {
        userId: user.id,
        lessonId,
        watchedSec,
        completed,
      },
      update: {
        watchedSec,
        completed,
      },
    });

    return NextResponse.json({ progress });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde" },
      { status: 500 }
    );
  }
}
