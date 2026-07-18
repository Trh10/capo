import { existsSync } from "fs";
import path from "path";

/** Dossier où les fichiers uploadés sont stockés et servis. */
export function getPublicUploadsDir(): string {
  if (process.env.UPLOADS_DIR?.trim()) {
    return process.env.UPLOADS_DIR.trim();
  }

  const cwd = process.cwd();

  if (existsSync(path.join(cwd, "server.js"))) {
    return path.join(cwd, "public", "uploads");
  }

  const standaloneUploads = path.join(
    cwd,
    ".next",
    "standalone",
    "public",
    "uploads"
  );
  if (
    process.env.NODE_ENV === "production" &&
    existsSync(path.join(cwd, ".next", "standalone", "server.js"))
  ) {
    return standaloneUploads;
  }

  return path.join(cwd, "public", "uploads");
}
