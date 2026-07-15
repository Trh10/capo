"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteCourseButtonProps {
  courseId: string;
}

export function DeleteCourseButton({ courseId }: DeleteCourseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        "Supprimer ce cours ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Erreur lors de la suppression");
        return;
      }

      router.push("/teacher");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "Suppression..." : "Supprimer le cours"}
    </button>
  );
}
