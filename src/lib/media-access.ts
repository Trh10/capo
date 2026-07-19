import { prisma } from "./prisma";
import { getCurrentUser } from "./auth";
import { hasPurchasedCourse } from "./course-access";
import { extractUploadFilename } from "./downloads";

export type MediaAccessResult =
  | { allowed: true; reason: "public" | "free" | "purchased" | "teacher" }
  | { allowed: false; status: 401 | 403; message: string };

/** Vérifie si un fichier /uploads/ peut être servi à l'utilisateur courant. */
export async function checkUploadMediaAccess(
  filename: string
): Promise<MediaAccessResult> {
  const uploadPath = `/uploads/${filename}`;

  const asAvatar = await prisma.user.findFirst({
    where: { avatarUrl: uploadPath },
    select: { id: true },
  });
  if (asAvatar) {
    return { allowed: true, reason: "public" };
  }

  const asThumbnail = await prisma.course.findFirst({
    where: { thumbnailUrl: uploadPath },
    select: { id: true },
  });
  if (asThumbnail) {
    return { allowed: true, reason: "public" };
  }

  const lesson = await prisma.lesson.findFirst({
    where: { videoUrl: uploadPath },
    select: {
      id: true,
      isFree: true,
      course: { select: { id: true, teacher: { select: { userId: true } } } },
    },
  });

  if (!lesson) {
    return {
      allowed: false,
      status: 403,
      message: "Accès refusé à ce fichier",
    };
  }

  if (lesson.isFree) {
    return { allowed: true, reason: "free" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return {
      allowed: false,
      status: 401,
      message: "Connectez-vous pour accéder à ce contenu",
    };
  }

  if (user.role === "TEACHER" && lesson.course.teacher.userId === user.id) {
    return { allowed: true, reason: "teacher" };
  }

  if (user.role === "ADMIN") {
    return { allowed: true, reason: "teacher" };
  }

  const purchased = await hasPurchasedCourse(user.id, lesson.course.id);
  if (!purchased) {
    return {
      allowed: false,
      status: 403,
      message: "Achetez le cours pour accéder à ce contenu",
    };
  }

  return { allowed: true, reason: "purchased" };
}

export async function checkMediaUrlAccess(url: string): Promise<MediaAccessResult> {
  const filename = extractUploadFilename(url);
  if (!filename) {
    return { allowed: true, reason: "public" };
  }
  return checkUploadMediaAccess(filename);
}
