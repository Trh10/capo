import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { MobileMenu } from "./MobileMenu";
import { HeaderLogoutButton } from "./HeaderLogoutButton";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo priority />

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/courses"
            className="text-sm font-medium text-foreground/80 transition hover:text-primary"
          >
            Cours
          </Link>
          <Link
            href="/teachers"
            className="text-sm font-medium text-foreground/80 transition hover:text-primary"
          >
            Professeurs
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex md:items-center md:gap-3">
            {user ? (
              <>
                <Link
                  href="/my-courses"
                  className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                >
                  Mes cours
                </Link>
                {user.role === "TEACHER" && (
                  <Link
                    href="/teacher"
                    className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                  >
                    Espace prof
                  </Link>
                )}
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-sm font-medium text-foreground/80 transition hover:text-primary"
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {user.firstName[0]}
                    </span>
                  )}
                  {user.firstName}
                </Link>
                <HeaderLogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          <MobileMenu
            user={user ? { firstName: user.firstName, role: user.role } : null}
          />
        </div>
      </div>
    </header>
  );
}
