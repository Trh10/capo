"use client";

import { useRef, useState } from "react";

interface ThumbnailUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
}

export function ThumbnailUpload({ value, onChange }: ThumbnailUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function upload(file: File): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "thumbnail");

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

      xhr.onerror = () => reject(new Error("Erreur réseau"));
      xhr.open("POST", "/api/teacher/upload");
      xhr.send(formData);
    });
  }

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    setProgress(0);

    try {
      const data = await upload(file);
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload échoué");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Miniature du cours"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg border border-dashed border-border px-4 py-2 text-sm transition hover:border-primary disabled:opacity-50"
      >
        {uploading
          ? `Upload miniature ${progress}%`
          : value
            ? "Changer la miniature"
            : "Uploader la miniature"}
      </button>

      <p className="text-xs text-muted">JPG, PNG ou WebP · max 10 Mo</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
