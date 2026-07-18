"use client";

import { useRef, useState } from "react";
import { withUploadCacheBust } from "@/lib/media-url";

interface AvatarUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  size?: "sm" | "md";
}

export function AvatarUpload({ value, onChange, size = "md" }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [previewBroken, setPreviewBroken] = useState(false);

  const sizeClass = size === "sm" ? "h-20 w-20" : "h-28 w-28";

  function upload(file: File): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

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
        reject(new Error("Erreur réseau — vérifiez votre connexion"));
      xhr.onabort = () => reject(new Error("Upload annulé"));
      xhr.ontimeout = () =>
        reject(new Error("Upload trop long — réessayez ou réduisez le fichier"));
      xhr.timeout = 0;
      xhr.withCredentials = true;
      xhr.open("POST", "/api/upload/avatar");
      xhr.send(formData);
    });
  }

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    setProgress(0);

    try {
      const data = await upload(file);
      setPreviewBroken(false);
      onChange(withUploadCacheBust(data.url));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload échoué");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-full border-2 border-border bg-secondary/10`}
      >
        {value && !previewBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Photo de profil"
            className="h-full w-full object-cover"
            onError={() => setPreviewBroken(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-muted">
            ?
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
            {progress}%
          </div>
        )}
      </div>

      <div>
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
          className="rounded-lg border border-border px-4 py-2 text-sm transition hover:border-primary disabled:opacity-50"
        >
          {uploading
            ? "Upload..."
            : value && !previewBroken
              ? "Changer la photo"
              : "Ajouter une photo"}
        </button>
        <p className="mt-1 text-xs text-muted">JPG, PNG ou WebP · max 10 Mo</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
