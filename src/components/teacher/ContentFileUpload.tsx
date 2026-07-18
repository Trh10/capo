"use client";

import { useRef, useState } from "react";
import {
  MAX_UPLOAD_LABEL,
  UPLOAD_ACCEPT,
} from "@/lib/upload-config";

interface ContentFileUploadProps {
  contentType: string;
  onUploaded: (url: string) => void;
  currentUrl?: string;
}

export function ContentFileUpload({
  contentType,
  onUploaded,
  currentUrl,
}: ContentFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState<string | null>(
    currentUrl ? currentUrl.split("/").pop() ?? null : null
  );

  function uploadWithProgress(file: File): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", contentType);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.error || "Upload échoué"));
          }
        } catch {
          reject(new Error("Réponse serveur invalide"));
        }
      };

      xhr.onerror = () =>
        reject(
          new Error(
            "Upload interrompu — fichier trop volumineux ou connexion coupée. Essayez un fichier plus petit ou le Wi‑Fi."
          )
        );
      xhr.onabort = () => reject(new Error("Upload annulé"));
      xhr.ontimeout = () =>
        reject(new Error("Upload trop long — réessayez avec une meilleure connexion"));
      xhr.timeout = 0;
      xhr.withCredentials = true;
      xhr.open("POST", "/api/teacher/upload");
      xhr.send(formData);
    });
  }

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    setProgress(0);
    setFileName(file.name);

    try {
      const data = await uploadWithProgress(file);
      onUploaded(data.url);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload échoué");
      setFileName(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const accept = UPLOAD_ACCEPT[contentType] ?? UPLOAD_ACCEPT.RESOURCE;

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border bg-background/50 p-4">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {uploading ? `Upload ${progress}%` : "Choisir un fichier"}
        </button>
        <span className="text-xs text-muted">
          Max {MAX_UPLOAD_LABEL} · vidéo, PDF, livre, syllabus…
        </span>
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {fileName && (
            <p className="text-xs text-muted">
              {fileName} — {progress}%
            </p>
          )}
        </div>
      )}

      {!uploading && fileName && (
        <p className="text-xs text-green-700">
          Fichier prêt : {fileName}
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
