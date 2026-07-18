"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AvatarUpload } from "./AvatarUpload";

interface ProfileFormProps {
  initial: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    bio?: string | null;
    specialty?: string | null;
    location?: string | null;
  };
}

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      firstName: formData.get("firstName")?.toString() ?? "",
      lastName: formData.get("lastName")?.toString() ?? "",
      avatarUrl: avatarUrl ? avatarUrl.split("?")[0] : "",
      ...(initial.role === "TEACHER" && {
        bio: formData.get("bio")?.toString() ?? "",
        specialty: formData.get("specialty")?.toString() ?? "",
        location: formData.get("location")?.toString() ?? "",
      }),
    };

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la mise à jour");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-medium">Photo de profil</p>
        <div className="mt-2">
          <AvatarUpload value={avatarUrl} onChange={setAvatarUrl} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">
            Prénom
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            defaultValue={initial.firstName}
            className={inputClass}
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
            defaultValue={initial.lastName}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <p className="mt-1 text-sm text-muted">{initial.email}</p>
      </div>

      {initial.role === "TEACHER" && (
        <>
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium">
              Spécialité
            </label>
            <input
              id="specialty"
              name="specialty"
              defaultValue={initial.specialty ?? ""}
              placeholder="Ex : Art textile, Cuisine..."
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium">
              Localisation
            </label>
            <input
              id="location"
              name="location"
              defaultValue={initial.location ?? ""}
              placeholder="Ex : Paris, France"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={initial.bio ?? ""}
              placeholder="Présentez-vous à vos élèves..."
              className={inputClass}
            />
          </div>
        </>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Profil mis à jour avec succès.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
