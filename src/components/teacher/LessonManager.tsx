"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CONTENT_TYPE_OPTIONS,
  getContentTypeLabel,
  getContentUrlLabel,
} from "@/lib/content-types";
import { ContentFileUpload } from "./ContentFileUpload";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  videoUrl: string | null;
  duration: number;
  order: number;
  isFree: boolean;
}

interface LessonManagerProps {
  courseId: string;
  initialLessons: Lesson[];
}

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

function LessonFields({
  lesson,
  contentUrl,
  contentType,
  onContentTypeChange,
  onContentUrlChange,
}: {
  lesson?: Lesson;
  contentUrl: string;
  contentType: string;
  onContentTypeChange: (value: string) => void;
  onContentUrlChange: (value: string) => void;
}) {
  return (
    <>
      <select
        name="contentType"
        value={contentType}
        onChange={(e) => onContentTypeChange(e.target.value)}
        className={inputClass}
      >
        {CONTENT_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} — {option.description}
          </option>
        ))}
      </select>

      <input
        name="videoUrl"
        value={contentUrl}
        onChange={(e) => onContentUrlChange(e.target.value)}
        placeholder={`${getContentUrlLabel(contentType)} — lien externe (optionnel si upload ci-dessous)`}
        className={inputClass}
      />

      <p className="text-xs text-muted">
        Uploadez directement votre fichier (jusqu&apos;à 5 Go) ou collez un lien
        externe (YouTube, Google Drive, Mux…).
      </p>

      <ContentFileUpload
        contentType={contentType}
        currentUrl={contentUrl.startsWith("/uploads/") ? contentUrl : undefined}
        onUploaded={onContentUrlChange}
      />
    </>
  );
}

export function LessonManager({ courseId, initialLessons }: LessonManagerProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initialLessons);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addContentType, setAddContentType] = useState("VIDEO");
  const [addContentUrl, setAddContentUrl] = useState("");
  const [editContentType, setEditContentType] = useState("VIDEO");
  const [editContentUrl, setEditContentUrl] = useState("");

  async function refreshLessons() {
    router.refresh();
    const res = await fetch(`/api/teacher/courses/${courseId}`);
    const data = await res.json();
    if (data.course?.lessons) {
      setLessons(data.course.lessons);
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get("title")?.toString() ?? "",
      contentType: addContentType,
      videoUrl: addContentUrl,
      durationMin: Number(formData.get("durationMin")),
      isFree: formData.get("isFree") === "on",
    };

    if (!payload.videoUrl.trim()) {
      setError("Ajoutez un fichier (upload) ou un lien externe");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'ajout");
        return;
      }

      (e.target as HTMLFormElement).reset();
      setAddContentType("VIDEO");
      setAddContentUrl("");
      await refreshLessons();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(lessonId: string, form: HTMLFormElement) {
    setError("");
    setLoading(true);

    const formData = new FormData(form);
    const payload = {
      title: formData.get("title")?.toString(),
      contentType: editContentType,
      videoUrl: editContentUrl,
      durationMin: Number(formData.get("durationMin")),
      isFree: formData.get("isFree") === "on",
    };

    try {
      const res = await fetch(
        `/api/teacher/courses/${courseId}/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la mise à jour");
        return;
      }

      setEditingId(null);
      await refreshLessons();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function handleMove(lessonId: string, direction: "up" | "down") {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/teacher/courses/${courseId}/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ direction }),
        }
      );

      const data = await res.json();
      if (res.ok && data.lessons) {
        setLessons(data.lessons);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(lessonId: string) {
    if (!confirm("Supprimer ce contenu ?")) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/teacher/courses/${courseId}/lessons/${lessonId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la suppression");
        return;
      }

      await refreshLessons();
    } finally {
      setLoading(false);
    }
  }

  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted">
            Aucun contenu pour le moment. Ajoutez une vidéo, un livre, un syllabus, etc.
          </p>
        ) : (
          sorted.map((lesson, index) => (
            <div
              key={lesson.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              {editingId === lesson.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleUpdate(lesson.id, e.currentTarget);
                  }}
                  className="space-y-3"
                >
                  <input
                    name="title"
                    defaultValue={lesson.title}
                    required
                    className={inputClass}
                  />
                  <LessonFields
                    lesson={lesson}
                    contentType={editContentType}
                    contentUrl={editContentUrl}
                    onContentTypeChange={setEditContentType}
                    onContentUrlChange={setEditContentUrl}
                  />
                  <input
                    name="durationMin"
                    type="number"
                    min="1"
                    defaultValue={Math.max(1, Math.round(lesson.duration / 60))}
                    className={inputClass}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isFree"
                      defaultChecked={lesson.isFree}
                    />
                    Accès gratuit (sans achat)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-border px-4 py-2 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {index + 1}. {lesson.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {getContentTypeLabel(lesson.contentType as "VIDEO")}
                      {" · "}
                      {Math.max(1, Math.round(lesson.duration / 60))} min
                      {lesson.isFree && " · Gratuit"}
                      {lesson.videoUrl ? " · Fichier OK" : " · Pas de fichier"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={loading || index === 0}
                      onClick={() => handleMove(lesson.id, "up")}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={loading || index === sorted.length - 1}
                      onClick={() => handleMove(lesson.id, "down")}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(lesson.id);
                        setEditContentType(lesson.contentType);
                        setEditContentUrl(lesson.videoUrl ?? "");
                      }}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(lesson.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="rounded-xl border border-dashed border-border p-4">
        <h3 className="font-medium">Ajouter un contenu</h3>
        <p className="mt-1 text-xs text-muted">
          Vidéo, livre, syllabus, document, audio ou ressource à télécharger.
        </p>
        <form onSubmit={handleAdd} className="mt-4 space-y-3">
          <input
            name="title"
            required
            placeholder="Titre"
            className={inputClass}
          />
          <LessonFields
            contentType={addContentType}
            contentUrl={addContentUrl}
            onContentTypeChange={setAddContentType}
            onContentUrlChange={setAddContentUrl}
          />
          <input
            name="durationMin"
            type="number"
            min="1"
            required
            defaultValue={5}
            placeholder="Durée estimée (minutes)"
            className={inputClass}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFree" />
            Accès gratuit (sans achat du cours)
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
