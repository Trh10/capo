"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
    >
      Se déconnecter
    </button>
  );
}
