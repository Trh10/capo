"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify } from "@/lib/slugify";
import { ThumbnailUpload } from "./ThumbnailUpload";

interface CourseFormProps {
  mode: "create" | "edit";
  courseId?: string;
  categorySuggestions: string[];
  initial?: {
    title: string;
    slug: string;
    description: string;
    shortDesc?: string | null;
    thumbnailUrl?: string | null;
    price: number;
    level: string;
    categoryName?: string | null;
    isPublished: boolean;
  };
}

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

export function CourseForm({
  mode,
  courseId,
  categorySuggestions,
  initial,
}: CourseFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const priceDisplay = Number(formData.get("priceDisplay"));
    const payload = {
      title,
      slug: mode === "edit" && initial?.slug ? initial.slug : slugify(title),
      description: formData.get("description")?.toString() ?? "",
      shortDesc: formData.get("shortDesc")?.toString() ?? "",
      thumbnailUrl,
      price: Math.round(priceDisplay * 100),
      level: formData.get("level")?.toString() ?? "Débutant",
      categoryName: formData.get("categoryName")?.toString() ?? "",
      isPublished: formData.get("isPublished") === "on",
    };

    try {
      const url =
        mode === "create"
          ? "/api/teacher/courses"
          : `/api/teacher/courses/${courseId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'enregistrement");
        return;
      }

      router.push(`/teacher/courses/${data.course.id}/edit?step=2`);
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "create" && (
        <div className="rounded-lg bg-primary/5 px-4 py-3 text-sm">
          <p className="font-medium text-primary">Étape 1 sur 2</p>
          <p className="mt-1 text-muted">
            Remplissez les infos du cours. À l&apos;étape suivante, vous
            uploadez vos vidéos, livres et syllabus.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Titre du cours
        </label>
        <input
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Miniature du cours</label>
        <div className="mt-1">
          <ThumbnailUpload value={thumbnailUrl} onChange={setThumbnailUrl} />
        </div>
      </div>

      <div>
        <label htmlFor="shortDesc" className="block text-sm font-medium">
          Résumé court
        </label>
        <input
          id="shortDesc"
          name="shortDesc"
          defaultValue={initial?.shortDesc ?? ""}
          maxLength={200}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={initial?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="priceDisplay" className="block text-sm font-medium">
            Prix ($)
          </label>
          <input
            id="priceDisplay"
            name="priceDisplay"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={initial ? (initial.price / 100).toFixed(2) : "5.99"}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium">
            Niveau
          </label>
          <select
            id="level"
            name="level"
            defaultValue={initial?.level ?? "Débutant"}
            className={inputClass}
          >
            <option value="Débutant">Débutant</option>
            <option value="Intermédiaire">Intermédiaire</option>
            <option value="Avancé">Avancé</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="categoryName" className="block text-sm font-medium">
          Catégorie
        </label>
        <input
          id="categoryName"
          name="categoryName"
          list="category-suggestions"
          defaultValue={initial?.categoryName ?? ""}
          placeholder="Ex : Art textile, Cuisine, Musique..."
          className={inputClass}
        />
        <datalist id="category-suggestions">
          {categorySuggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={initial?.isPublished ?? false}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        Publier le cours (visible dans le catalogue)
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
      >
        {loading
          ? "Enregistrement..."
          : mode === "create"
            ? "Créer le cours → étape 2"
            : "Enregistrer"}
      </button>
    </form>
  );
}
