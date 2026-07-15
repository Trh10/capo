import { ReactNode } from "react";
import Link from "next/link";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="relative">
          <Link href="/" className="text-3xl font-bold text-primary">
            CAPO
          </Link>
        </div>

        <div className="relative">
          <blockquote className="text-3xl font-bold leading-tight text-foreground">
            &ldquo;Chaque cours est une porte ouverte sur un nouveau savoir-faire.&rdquo;
          </blockquote>
          <p className="mt-6 text-muted">
            Rejoignez une communauté de créatifs passionnés.
          </p>
        </div>

        <div className="relative flex gap-8">
          <div>
            <p className="text-2xl font-bold text-foreground">+50</p>
            <p className="text-sm text-muted">Cours</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">+20</p>
            <p className="text-sm text-muted">Professeurs</p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-card px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="text-2xl font-bold text-primary lg:hidden">
            CAPO
          </Link>
          <h1 className="mt-6 text-2xl font-bold lg:mt-0">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
