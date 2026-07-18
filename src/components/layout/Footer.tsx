import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="bg-[#201e1d] text-[#bab6b6]">
      <div className="px-4 py-12 sm:px-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo variant="onDark" href="/" className="h-9" />
            <p className="mt-3.5 max-w-[280px] text-sm leading-relaxed text-[#9b9797]">
              La plateforme de cours créatifs et d&apos;artisanat pour apprendre,
              créer et progresser.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-background">Plateforme</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/courses" className="transition hover:text-background">
                  Cours
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="transition hover:text-background">
                  Professeurs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-background">Compte</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/login" className="transition hover:text-background">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition hover:text-background">
                  Inscription
                </Link>
              </li>
              <li>
                <Link href="/account" className="transition hover:text-background">
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-background">Application</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#9b9797]">
              L&apos;application mobile arrive bientôt.
            </p>
          </div>
        </div>
        <div className="mt-9 border-t border-background/15 pt-6 text-sm text-[#7d7979]">
          &copy; {new Date().getFullYear()} CAPO Studio. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
