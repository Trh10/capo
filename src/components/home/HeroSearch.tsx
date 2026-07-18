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
    <form
      onSubmit={handleSubmit}
      className="mt-9 flex max-w-xl animate-[fade-up_.6s_.2s_ease_both] flex-col gap-3 sm:flex-row sm:gap-0"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un cours, une technique…"
        className="w-full flex-1 border-2 border-border bg-background px-5 py-3 text-base placeholder:text-muted outline-none focus:border-primary sm:text-sm"
      />
      <button
        type="submit"
        className="w-full border-2 border-primary bg-primary px-6 py-3 text-left text-sm font-semibold text-background transition hover:bg-primary-dark sm:w-auto"
      >
        Rechercher
      </button>
    </form>
  );
}
