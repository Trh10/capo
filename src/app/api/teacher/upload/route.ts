import { NextRequest, NextResponse } from "next/server";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { getTeacherContext } from "@/lib/teacher";
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  MAX_THUMBNAIL_BYTES,
  isAllowedThumbnail,
  isAllowedUpload,
} from "@/lib/upload-config";

export const runtime = "nodejs";
export const maxDuration = 600;

export async function POST(request: NextRequest) {
  const context = await getTeacherContext();
  if (!context) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const purpose = formData.get("purpose")?.toString() || "content";
    const contentType = formData.get("contentType")?.toString() || "RESOURCE";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    if (purpose === "thumbnail") {
      if (file.size > MAX_THUMBNAIL_BYTES) {
        return NextResponse.json(
          { error: "Miniature trop volumineuse (max 10 Mo)" },
          { status: 400 }
        );
      }

      if (!isAllowedThumbnail(file.name, file.type)) {
        return NextResponse.json(
          { error: "Format non accepté — utilisez JPG, PNG ou WebP" },
          { status: 400 }
        );
      }
    } else {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: `Fichier trop volumineux (max ${MAX_UPLOAD_LABEL})` },
          { status: 400 }
        );
      }

      if (!isAllowedUpload(contentType, file.name, file.type)) {
        return NextResponse.json(
          {
            error: `Type de fichier non accepté. Vérifiez l'extension (${file.name}).`,
          },
          { status: 400 }
        );
      }
    }

    const ext = path.extname(file.name) || ".bin";
    const filename = `${randomUUID()}${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const destination = path.join(uploadsDir, filename);
    const webStream = file.stream();
    const nodeStream = Readable.fromWeb(
      webStream as Parameters<typeof Readable.fromWeb>[0]
    );
    await pipeline(nodeStream, createWriteStream(destination));

    return NextResponse.json({
      url: `/uploads/${filename}`,
      size: file.size,
      name: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
