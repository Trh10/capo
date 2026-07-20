import { prisma } from "./prisma";

export async function canStudentContactTeacher(
  studentId: string,
  teacherUserId: string,
  courseId: string
): Promise<boolean> {
  if (studentId === teacherUserId) return false;

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      isPublished: true,
      teacher: { userId: teacherUserId },
    },
    select: { id: true },
  });

  return Boolean(course);
}

export async function getConversationForUser(
  conversationId: string,
  userId: string
) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ studentId: userId }, { teacherUserId: userId }],
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
}

export async function markConversationRead(
  conversationId: string,
  userId: string
) {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}
