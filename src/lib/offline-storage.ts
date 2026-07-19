import {
  getClientDeviceFingerprint,
  getClientDevicePlatform,
} from "./device-fingerprint";

const DB_NAME = "capo-offline";
const STORE_NAME = "lessons";
const DB_VERSION = 1;

export interface OfflineLessonRecord {
  lessonId: string;
  courseSlug: string;
  lessonSlug: string;
  title: string;
  contentType: string;
  mimeType: string;
  savedAt: string;
  blob: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "lessonId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveOfflineLesson(record: OfflineLessonRecord): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getOfflineLesson(
  lessonId: string
): Promise<OfflineLessonRecord | null> {
  const db = await openDb();
  const result = await new Promise<OfflineLessonRecord | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(lessonId);
    req.onsuccess = () => resolve((req.result as OfflineLessonRecord) || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function listOfflineLessons(): Promise<OfflineLessonRecord[]> {
  const db = await openDb();
  const result = await new Promise<OfflineLessonRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve((req.result as OfflineLessonRecord[]) || []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function removeOfflineLesson(lessonId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(lessonId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function getOfflineBlobUrl(record: OfflineLessonRecord): string {
  return URL.createObjectURL(record.blob);
}

export function deviceRequestHeaders(): Record<string, string> {
  if (typeof navigator === "undefined") return {};
  return {
    "X-Device-Fingerprint": getClientDeviceFingerprint(),
    "X-Device-Type": getClientDevicePlatform(),
    "X-Device-Name":
      getClientDevicePlatform() === "MOBILE" ? "Application CAPO" : "Navigateur web",
  };
}
