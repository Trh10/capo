import { prisma } from "./prisma";

export const PREVIEW_DURATION_SEC = 60;

export async function hasPurchasedCourse(
  userId: string | undefined,
  courseId: string
): Promise<boolean> {
  if (!userId) return false;

  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  return purchase?.status === "COMPLETED";
}

/** Accès complet : acheté, prof du cours, ou admin. */
export async function hasFullCourseAccess(
  userId: string | undefined,
  courseId: string,
  courseTeacherUserId?: string
): Promise<boolean> {
  if (!userId) return false;

  if (courseTeacherUserId && courseTeacherUserId === userId) {
    return true;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role === "ADMIN") return true;

  return hasPurchasedCourse(userId, courseId);
}

export function canWatchLessonFully(
  hasCourseAccess: boolean,
  isFree: boolean
): boolean {
  return hasCourseAccess || isFree;
}

export function getMaxWatchSeconds(
  hasCourseAccess: boolean,
  isFree: boolean
): number | null {
  if (canWatchLessonFully(hasCourseAccess, isFree)) {
    return null;
  }
  return PREVIEW_DURATION_SEC;
}
