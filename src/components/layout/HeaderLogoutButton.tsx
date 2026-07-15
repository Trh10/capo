"use client";

import { useRouter } from "next/navigation";

export function HeaderLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm font-medium text-red-600 transition hover:text-red-700"
    >
      Déconnexion
    </button>
  );
}
