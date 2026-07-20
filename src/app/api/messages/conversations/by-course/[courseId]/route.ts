import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canStudentContactTeacher } from "@/lib/messaging";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { courseId } = await params;
    const teacherUserId = request.nextUrl.searchParams.get("teacherUserId");

    if (!teacherUserId) {
      return NextResponse.json(
        { error: "Professeur requis" },
        { status: 400 }
      );
    }

    if (user.role === "TEACHER" && user.id === teacherUserId) {
      return NextResponse.json({ conversation: null });
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json({ conversation: null });
    }

    const allowed = await canStudentContactTeacher(
      user.id,
      teacherUserId,
      courseId
    );

    if (!allowed) {
      return NextResponse.json({ conversation: null });
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        studentId_teacherUserId_courseId: {
          studentId: user.id,
          teacherUserId,
          courseId,
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ conversation });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
