import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canStudentContactTeacher } from "@/lib/messaging";
import { prisma } from "@/lib/prisma";
import { startConversationSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where:
        user.role === "TEACHER"
          ? { teacherUserId: user.id }
          : { studentId: user.id },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        teacher: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        course: { select: { id: true, title: true, slug: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            body: true,
            senderId: true,
            createdAt: true,
            readAt: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const withUnread = conversations.map((conversation) => {
      const lastMessage = conversation.messages[0] ?? null;
      const unreadCount =
        lastMessage &&
        lastMessage.senderId !== user.id &&
        !lastMessage.readAt
          ? 1
          : 0;

      return {
        id: conversation.id,
        student: conversation.student,
        teacher: conversation.teacher,
        course: conversation.course,
        updatedAt: conversation.updatedAt,
        lastMessage,
        unreadCount,
      };
    });

    return NextResponse.json({ conversations: withUnread });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du chargement des conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Seuls les élèves peuvent démarrer une conversation" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = startConversationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { courseId, teacherUserId, message } = parsed.data;

    const allowed = await canStudentContactTeacher(
      user.id,
      teacherUserId,
      courseId
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Impossible de contacter ce professeur pour ce cours" },
        { status: 403 }
      );
    }

    const conversation = await prisma.conversation.upsert({
      where: {
        studentId_teacherUserId_courseId: {
          studentId: user.id,
          teacherUserId,
          courseId,
        },
      },
      create: {
        studentId: user.id,
        teacherUserId,
        courseId,
        messages: {
          create: {
            senderId: user.id,
            body: message,
          },
        },
      },
      update: {
        updatedAt: new Date(),
        messages: {
          create: {
            senderId: user.id,
            body: message,
          },
        },
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        teacher: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        course: { select: { id: true, title: true, slug: true } },
      },
    });

    return NextResponse.json({ conversation });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création de la conversation" },
      { status: 500 }
    );
  }
}
