"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/courses?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/courses");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row sm:gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un cours, une technique…"
        className="w-full flex-1 rounded-full border border-border bg-card px-5 py-3.5 text-base text-foreground placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:px-6 sm:text-sm"
      />
      <button
        type="submit"
        className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-dark sm:w-auto"
      >
        Rechercher
      </button>
    </form>
  );
}
