export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 * 1024; // 5 Go

export const MAX_UPLOAD_LABEL = "5 Go";

export const MAX_THUMBNAIL_BYTES = 10 * 1024 * 1024; // 10 Mo

export const THUMBNAIL_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export const UPLOAD_EXTENSIONS: Record<string, string[]> = {
  VIDEO: [".mp4", ".webm", ".mov", ".mkv", ".m4v", ".avi"],
  DOCUMENT: [".pdf", ".doc", ".docx"],
  BOOK: [".pdf", ".epub", ".mobi"],
  SYLLABUS: [".pdf", ".doc", ".docx"],
  AUDIO: [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
  RESOURCE: [
    ".pdf",
    ".epub",
    ".zip",
    ".mp4",
    ".png",
    ".jpg",
    ".jpeg",
    ".doc",
    ".docx",
  ],
};

export const UPLOAD_ACCEPT: Record<string, string> = {
  VIDEO: "video/*,.mp4,.webm,.mov,.mkv,.m4v,.avi",
  DOCUMENT: ".pdf,.doc,.docx,application/pdf",
  BOOK: ".pdf,.epub,.mobi,application/pdf,application/epub+zip",
  SYLLABUS: ".pdf,.doc,.docx,application/pdf",
  AUDIO: "audio/*,.mp3,.wav,.m4a,.aac,.ogg",
  RESOURCE: ".pdf,.epub,.zip,.mp4,.png,.jpg,.jpeg,.doc,.docx,video/*,audio/*",
};

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(0)} Ko`;
  }
  return `${bytes} o`;
}

export function isAllowedThumbnail(filename: string, mimeType: string): boolean {
  const ext = filename.includes(".")
    ? filename.slice(filename.lastIndexOf(".")).toLowerCase()
    : "";

  if (ext && THUMBNAIL_EXTENSIONS.includes(ext)) return true;
  if (mimeType.startsWith("image/")) return true;
  return false;
}

export function isAllowedUpload(
  contentType: string,
  filename: string,
  mimeType: string
): boolean {
  const extensions =
    UPLOAD_EXTENSIONS[contentType] ?? UPLOAD_EXTENSIONS.RESOURCE;
  const ext = filename.includes(".")
    ? filename.slice(filename.lastIndexOf(".")).toLowerCase()
    : "";

  if (ext && extensions.includes(ext)) {
    return true;
  }

  const genericMimes = ["application/octet-stream", ""];
  if (genericMimes.includes(mimeType) && ext && extensions.includes(ext)) {
    return true;
  }

  return false;
}
