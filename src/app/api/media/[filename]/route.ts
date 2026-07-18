import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { getPublicUploadsDir } from "@/lib/uploads-dir";
import { getMediaMimeType } from "@/lib/media-types";

export const runtime = "nodejs";

function safeFilename(raw: string): string | null {
  const filename = path.basename(raw);
  if (!filename || filename !== raw || filename.includes("..")) {
    return null;
  }
  return filename;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename: rawFilename } = await params;
  const filename = safeFilename(rawFilename);
  if (!filename) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  const filePath = path.join(getPublicUploadsDir(), filename);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
    }

    const contentType = getMediaMimeType(filename);
    const range = request.headers.get("range");

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        return new NextResponse(null, { status: 416 });
      }

      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end = match[2] ? parseInt(match[2], 10) : fileStat.size - 1;

      if (start >= fileStat.size || end >= fileStat.size || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileStat.size}` },
        });
      }

      const chunkSize = end - start + 1;
      const stream = Readable.toWeb(
        createReadStream(filePath, { start, end })
      ) as ReadableStream;

      return new NextResponse(stream, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(chunkSize),
          "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileStat.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }
}
