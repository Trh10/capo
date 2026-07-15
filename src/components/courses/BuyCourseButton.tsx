"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface BuyCourseButtonProps {
  courseSlug: string;
  isLoggedIn: boolean;
}

export function BuyCourseButton({ courseSlug, isLoggedIn }: BuyCourseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/courses/${courseSlug}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'achat");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
        router.refresh();
      }
    } catch {
      setError("Erreur réseau, réessayez");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleBuy}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? "Redirection..." : "Acheter le cours"}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
