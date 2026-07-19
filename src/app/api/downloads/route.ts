import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listUserDownloads, registerLessonDownload, resolveUserDevice } from "@/lib/downloads";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const downloads = await listUserDownloads(user.id);
  return NextResponse.json({
    downloads: downloads.map((d) => ({
      id: d.id,
      status: d.status,
      downloadedAt: d.downloadedAt,
      lesson: d.lesson,
      device: d.device,
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const lessonId = body?.lessonId as string | undefined;
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId requis" }, { status: 400 });
  }

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
