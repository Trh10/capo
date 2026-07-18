import { NextRequest, NextResponse } from "next/server";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import {
  MAX_THUMBNAIL_BYTES,
  isAllowedThumbnail,
} from "@/lib/upload-config";
import { getPublicUploadsDir } from "@/lib/uploads-dir";

export const runtime = "nodejs";
export const maxDuration = 600;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    if (file.size > MAX_THUMBNAIL_BYTES) {
      return NextResponse.json(
        { error: "Photo trop volumineuse (max 10 Mo)" },
        { status: 400 }
      );
    }

    if (!isAllowedThumbnail(file.name, file.type)) {
      return NextResponse.json(
        { error: "Format non accepté — utilisez JPG, PNG ou WebP" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || ".jpg";
    const filename = `avatar-${randomUUID()}${ext}`;
    const uploadsDir = getPublicUploadsDir();
    await mkdir(uploadsDir, { recursive: true });

    const destination = path.join(uploadsDir, filename);
    const webStream = file.stream();
    const nodeStream = Readable.fromWeb(
      webStream as Parameters<typeof Readable.fromWeb>[0]
    );
    await pipeline(nodeStream, createWriteStream(destination));

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de la photo" },
      { status: 500 }
    );
  }
}
