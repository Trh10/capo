import { randomUUID } from "crypto";
import { DeviceType, LessonContentType } from "@prisma/client";
import { prisma } from "./prisma";
import {
  canDownloadLessonOnDevice,
  registerDevice,
} from "./devices";
import { hasPurchasedCourse } from "./course-access";
import { generateDeviceFingerprint } from "./device-fingerprint";

export async function resolveUserDevice(
  userId: string,
  request: Request
): Promise<{ id: string; name: string } | null> {
  const fingerprint =
    request.headers.get("x-device-fingerprint")?.trim() ||
    generateDeviceFingerprint(
      request.headers.get("user-agent") || "unknown",
      request.headers.get("x-device-type") || "WEB"
    );

  const deviceType = (request.headers.get("x-device-type") ||
    "WEB") as DeviceType;

  let device = await prisma.device.findUnique({
    where: { userId_fingerprint: { userId, fingerprint } },
    select: { id: true, name: true },
  });

  if (!device) {
    const name =
      request.headers.get("x-device-name")?.trim() ||
      (deviceType === "MOBILE" ? "Application mobile" : "Navigateur web");
    const created = await registerDevice(userId, fingerprint, name, deviceType);
    device = { id: created.id, name: created.name };
  }

  return device;
}

export async function getLessonDownloadAccess(
  userId: string,
  lessonId: string,
  deviceId: string
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: { select: { id: true, slug: true, title: true, isPublished: true } },
    },
  });

  if (!lesson || !lesson.course.isPublished) {
    return { error: "Leçon introuvable", status: 404 as const };
  }

  if (!lesson.videoUrl) {
    return { error: "Aucun fichier à télécharger pour cette leçon", status: 400 as const };
  }

  const purchased = await hasPurchasedCourse(userId, lesson.course.id);
  if (!purchased && !lesson.isFree) {
    return { error: "Achetez le cours pour télécharger cette leçon", status: 403 as const };
  }

  const deviceCheck = await canDownloadLessonOnDevice(userId, lessonId, deviceId);
  if (!deviceCheck.allowed) {
    return { error: deviceCheck.reason || "Téléchargement non autorisé", status: 403 as const };
  }

  return { lesson, purchased };
}

export type DownloadErrorResult = { error: string; status: 404 | 400 | 403 };

export type RegisteredDownloadResult = {
  download: {
    id: string;
    licenseKey: string;
    status: string;
    downloadedAt: Date | null;
  };
  lesson: {
    id: string;
    title: string;
    slug: string;
    videoUrl: string | null;
    contentType: LessonContentType;
    course: { slug: string; title: string };
  };
};

export async function registerLessonDownload(
  userId: string,
  lessonId: string,
  deviceId: string
): Promise<DownloadErrorResult | RegisteredDownloadResult> {
  const access = await getLessonDownloadAccess(userId, lessonId, deviceId);
  if ("error" in access) {
    return { error: access.error!, status: access.status! };
  }

  const licenseKey = randomUUID();

  const download = await prisma.download.upsert({
    where: {
      userId_lessonId_deviceId: { userId, lessonId, deviceId },
    },
    create: {
      userId,
      lessonId,
      deviceId,
      licenseKey,
      status: "READY",
      downloadedAt: new Date(),
    },
    update: {
      licenseKey,
      status: "READY",
      downloadedAt: new Date(),
    },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          slug: true,
          videoUrl: true,
          contentType: true,
          course: { select: { slug: true, title: true } },
        },
      },
      device: { select: { name: true } },
    },
  });

  return {
    download: {
      id: download.id,
      licenseKey: download.licenseKey,
      status: download.status,
      downloadedAt: download.downloadedAt,
    },
    lesson: download.lesson,
  };
}

export async function listUserDownloads(userId: string) {
  return prisma.download.findMany({
    where: { userId, status: { in: ["PENDING", "READY"] } },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          slug: true,
          videoUrl: true,
          contentType: true,
          course: { select: { slug: true, title: true } },
        },
      },
      device: { select: { id: true, name: true } },
    },
    orderBy: { downloadedAt: "desc" },
  });
}

export function extractUploadFilename(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = /\/uploads\/([^/?#]+)/.exec(url);
  return match?.[1] ?? null;
}
