"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ContactTeacherButtonProps {
  courseId: string;
  courseSlug: string;
  teacherUserId: string;
  teacherName: string;
  isLoggedIn: boolean;
  variant?: "primary" | "outline" | "overlay";
  className?: string;
}

export function ContactTeacherButton({
  courseId,
  courseSlug,
  teacherUserId,
  teacherName,
  isLoggedIn,
  variant = "outline",
  className = "",
}: ContactTeacherButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchRedirect = `/watch/${courseSlug}`;

  function handleOpen() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(watchRedirect)}`);
      return;
    }
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          teacherUserId,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible d'envoyer le message");
        return;
      }

      router.push(`/messages/${data.conversation.id}`);
    } catch {
      setError("Erreur réseau, réessayez");
    } finally {
      setLoading(false);
    }
  }

  const variantClasses = {
    primary:
      "rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:bg-secondary/90 sm:text-sm",
    outline:
      "rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary",
    overlay:
      "rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:text-sm",
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`shrink-0 ${variantClasses[variant]} ${className}`}
      >
        Contacter ce professeur
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div
            className="absolute inset-0"
            onClick={() => !loading && setOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-lg border-2 border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold">Message à {teacherName}</h2>
            <p className="mt-1 text-sm text-muted">
              Posez votre question en privé. Le professeur recevra votre message
              dans sa messagerie.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="Bonjour, je ne comprends pas bien cette partie de la leçon..."
                className="w-full resize-none border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                autoFocus
                maxLength={2000}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="rounded-lg border-2 border-border px-4 py-2 text-sm font-medium transition hover:bg-background disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? "Envoi..." : "Envoyer le message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
