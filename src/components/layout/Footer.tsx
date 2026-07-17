import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo variant="onDark" href="/" className="h-10" />
            <p className="mt-3 text-sm text-neutral-400">
              La plateforme de cours créatifs et d&apos;artisanat pour apprendre,
              créer et progresser.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Plateforme</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/courses" className="transition hover:text-white">
                  Cours
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="transition hover:text-white">
                  Professeurs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Compte</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-400">
              <li>
                <Link href="/login" className="transition hover:text-white">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition hover:text-white">
                  Inscription
                </Link>
              </li>
              <li>
                <Link href="/account" className="transition hover:text-white">
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Application</h3>
            <p className="mt-3 text-sm text-neutral-400">
              L&apos;application mobile arrive bientôt.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} CAPO Studio. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
