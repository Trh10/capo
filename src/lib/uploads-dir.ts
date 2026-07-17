import { existsSync } from "fs";
import path from "path";

/** Dossier public/uploads servi par Next.js (standalone ou dev). */
export function getPublicUploadsDir(): string {
  const cwd = process.cwd();

  // Serveur standalone : cwd = .next/standalone
  if (existsSync(path.join(cwd, "server.js"))) {
    return path.join(cwd, "public", "uploads");
  }

  // Prod lancée depuis la racine du projet
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
