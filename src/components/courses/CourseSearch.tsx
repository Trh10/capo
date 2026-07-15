"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CourseSearchProps {
  categories: { name: string; slug: string }[];
  initialQuery?: string;
  initialCategory?: string;
}

export function CourseSearch({
  categories,
  initialQuery,
  initialCategory,
}: CourseSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery || "");
  const [category, setCategory] = useState(initialCategory || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    router.push(`/courses?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un cours..."
        className="w-full min-w-0 flex-1 rounded-lg border border-border bg-card px-4 py-3 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:py-2.5 sm:text-sm"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base outline-none focus:border-primary sm:w-auto sm:py-2.5 sm:text-sm"
      >
        <option value="">Toutes catégories</option>
        {categories.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark sm:w-auto sm:py-2.5"
      >
        Rechercher
      </button>
    </form>
  );
}
