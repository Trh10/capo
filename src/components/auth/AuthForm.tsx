"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AvatarUpload } from "@/components/account/AvatarUpload";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [avatarUrl, setAvatarUrl] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    if (mode === "login") {
      body.deviceName = "Navigateur web";
      body.deviceType = "WEB";
    } else {
      body.role = role;
      if (avatarUrl) body.avatarUrl = avatarUrl;
    }

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      if (mode === "register" && data.user?.role === "TEACHER") {
        router.push("/teacher");
      } else {
        router.push(redirectTo || "/");
      }
      router.refresh();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  const alternateHref =
    mode === "login"
      ? redirectTo
        ? `/register?redirect=${encodeURIComponent(redirectTo)}`
        : "/register"
      : redirectTo
        ? `/login?redirect=${encodeURIComponent(redirectTo)}`
        : "/login";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium">Je m&apos;inscris en tant que</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`border-2 p-4 text-left text-sm transition ${
                  role === "STUDENT"
                    ? "border-primary bg-[#ffe0d9]/40"
                    : "border-border hover:border-primary"
                }`}
              >
                <p className="font-semibold">Élève</p>
                <p className="mt-1 text-xs text-muted">
                  Acheter et suivre des cours
                </p>
              </button>
              <button
                type="button"
                onClick={() => setRole("TEACHER")}
                className={`border-2 p-4 text-left text-sm transition ${
                  role === "TEACHER"
                    ? "border-primary bg-[#ffe0d9]/40"
                    : "border-border hover:border-primary"
                }`}
              >
                <p className="font-semibold">Professeur</p>
                <p className="mt-1 text-xs text-muted">
                  Créer et vendre mes contenus
                </p>
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Photo de profil</p>
            <AvatarUpload value={avatarUrl} onChange={setAvatarUrl} size="sm" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium">
                Prénom
              </label>
              <input
                id="firstName"
                name="firstName"
                required
                className="mt-1 w-full border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">
                Nom
              </label>
              <input
                id="lastName"
                name="lastName"
                required
                className="mt-1 w-full border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {role === "TEACHER" && (
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium">
                Spécialité (optionnel)
              </label>
              <input
                id="specialty"
                name="specialty"
                placeholder="Ex : Art textile, Cuisine, Musique..."
                className="mt-1 w-full border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          )}
        </>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full border-2 border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      {error && (
        <p className="border-2 border-primary/30 bg-[#ffe0d9]/30 px-4 py-3 text-sm text-primary-deep">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary py-3 text-left text-sm font-semibold text-background transition hover:bg-primary-dark disabled:opacity-50"
      >
        {loading
          ? "Chargement..."
          : mode === "login"
            ? "Se connecter"
            : role === "TEACHER"
              ? "Créer mon compte professeur"
              : "Créer mon compte élève"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            Pas encore de compte ?{" "}
            <Link href={alternateHref} className="font-medium text-primary hover:underline">
              S&apos;inscrire
            </Link>
          </>
        ) : (
          <>
            Déjà un compte ?{" "}
            <Link href={alternateHref} className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
