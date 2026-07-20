"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMobileNav } from "@/components/mobile/MobileNavProvider";

interface MobileMenuProps {
  user: {
    firstName: string;
    role?: string;
  } | null;
}

export function MobileMenu({ user }: MobileMenuProps) {
  const router = useRouter();
  const { menuOpen: open, setMenuOpen: setOpen } = useMobileNav();

  const links = [
    { href: "/courses", label: "Cours" },
    { href: "/teachers", label: "Professeurs" },
    ...(user ? [{ href: "/my-courses", label: "Mes cours" }] : []),
    ...(user ? [{ href: "/messages", label: "Messages" }] : []),
    ...(user?.role === "TEACHER"
      ? [{ href: "/teacher", label: "Espace prof" }]
      : []),
    ...(user ? [{ href: "/account", label: "Mon compte" }] : []),
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex h-10 w-10 items-center justify-center border-2 border-border"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute left-0 right-0 top-16 z-50 border-b-2 border-border bg-card px-4 py-4">
            {user && (
              <p className="mb-2 px-2 text-sm font-semibold uppercase tracking-[.08em] text-primary-deep">
                Bonjour {user.firstName}
              </p>
            )}
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-2 py-3 text-sm font-medium transition hover:bg-background hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user && (
                <li className="border-t border-border-soft pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-2 py-3 text-left text-sm font-medium text-primary transition hover:bg-[#ffe0d9]/30"
                  >
                    Déconnexion
                  </button>
                </li>
              )}
              {!user && (
                <>
                  <li className="border-t border-border-soft pt-2">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block px-2 py-3 text-sm font-medium transition hover:bg-background"
                    >
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="block bg-primary px-2 py-3 text-left text-sm font-semibold text-background"
                    >
                      S&apos;inscrire
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
