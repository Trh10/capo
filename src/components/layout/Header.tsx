import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import { MobileMenu } from "./MobileMenu";
import { HeaderLogoutButton } from "./HeaderLogoutButton";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-background/90 backdrop-blur-md">
      <div className="relative flex h-16 items-center gap-8 px-4 sm:px-10">
        <Logo priority />

        <nav className="hidden items-center gap-6 md:flex">
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

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex md:items-center md:gap-5">
            {user ? (
              <>
                <Link
                  href="/my-courses"
                  className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                >
                  Mes cours
                </Link>
                <Link
                  href="/messages"
                  className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                >
                  Messages
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
                      className="h-8 w-8 object-cover grayscale"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center bg-primary/10 text-xs font-semibold text-primary-deep">
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
                  className="inline-flex justify-start bg-primary px-5 py-2 text-sm font-semibold text-background transition hover:bg-primary-dark"
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
