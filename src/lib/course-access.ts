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

export function canWatchLessonFully(
  hasPurchased: boolean,
  isFree: boolean
): boolean {
  return hasPurchased || isFree;
}

export function getMaxWatchSeconds(
  hasPurchased: boolean,
  isFree: boolean
): number | null {
  if (canWatchLessonFully(hasPurchased, isFree)) {
    return null;
  }
  return PREVIEW_DURATION_SEC;
}
