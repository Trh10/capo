"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Device {
  id: string;
  name: string;
  type: string;
  lastActiveAt: string;
}

export function DeviceList({ devices }: { devices: Device[] }) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);

  async function removeDevice(id: string) {
    setRemoving(id);
    try {
      await fetch(`/api/devices/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setRemoving(null);
    }
  }

  const typeLabels: Record<string, string> = {
    WEB: "Navigateur",
    MOBILE: "Téléphone",
    DESKTOP: "Ordinateur",
  };

  return (
    <div className="space-y-3">
      {devices.map((device) => (
        <div
          key={device.id}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
        >
          <div>
            <p className="font-medium">{device.name}</p>
            <p className="text-sm text-muted">
              {typeLabels[device.type] || device.type} · Dernière activité :{" "}
              {new Date(device.lastActiveAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <button
            onClick={() => removeDevice(device.id)}
            disabled={removing === device.id}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {removing === device.id ? "..." : "Retirer"}
          </button>
        </div>
      ))}
      {devices.length === 0 && (
        <p className="text-sm text-muted">Aucun appareil enregistré.</p>
      )}
      <p className="text-xs text-muted">
        Plusieurs appareils peuvent se connecter pour regarder vos cours en
        ligne. Le téléchargement offline est limité à un seul appareil par
        leçon : si une vidéo est déjà téléchargée sur un téléphone, elle ne
        pourra pas être retéléchargée ailleurs sur le même compte.
      </p>
    </div>
  );
}
