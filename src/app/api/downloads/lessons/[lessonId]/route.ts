import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getLessonDownloadAccess,
  registerLessonDownload,
  resolveUserDevice,
} from "@/lib/downloads";
import { canDownloadLessonOnDevice } from "@/lib/devices";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { lessonId } = await params;
  const device = await resolveUserDevice(user.id, request);
  if (!device) {
    return NextResponse.json({ error: "Appareil introuvable" }, { status: 400 });
  }

  const access = await getLessonDownloadAccess(user.id, lessonId, device.id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const existing = await prisma.download.findUnique({
    where: {
      userId_lessonId_deviceId: {
        userId: user.id,
        lessonId,
        deviceId: device.id,
      },
    },
    select: { id: true, status: true, downloadedAt: true },
  });

  const deviceCheck = await canDownloadLessonOnDevice(
    user.id,
    lessonId,
    device.id
  );

  return NextResponse.json({
    canDownload: deviceCheck.allowed,
    reason: deviceCheck.reason,
    status: existing?.status ?? null,
    downloadedAt: existing?.downloadedAt ?? null,
    isReady: existing?.status === "READY",
    lesson: {
      id: access.lesson.id,
      title: access.lesson.title,
      videoUrl: access.lesson.videoUrl,
      contentType: access.lesson.contentType,
    },
  });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { lessonId } = await params;
  const device = await resolveUserDevice(user.id, request);
  if (!device) {
    return NextResponse.json({ error: "Appareil introuvable" }, { status: 400 });
  }

  const result = await registerLessonDownload(user.id, lessonId, device.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { download, lesson } = result;

  return NextResponse.json({
    download: {
      id: download.id,
      status: download.status,
      licenseKey: download.licenseKey,
      downloadedAt: download.downloadedAt,
    },
    lesson: {
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      contentType: lesson.contentType,
      videoUrl: lesson.videoUrl,
      course: lesson.course,
    },
    downloadUrl: lesson.videoUrl,
  });
}
