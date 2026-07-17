import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo href="/" className="h-10" />
            <p className="mt-2 text-sm text-muted">
              La plateforme de cours créatifs et d&apos;artisanat pour apprendre, créer et progresser.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Plateforme</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href="/courses" className="hover:text-primary">
                  Cours
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="hover:text-primary">
                  Professeurs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Compte</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href="/login" className="hover:text-primary">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary">
                  Inscription
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-primary">
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Application</h3>
            <p className="mt-3 text-sm text-muted">
              L&apos;application mobile arrive bientôt.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} CAPO Studio. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
