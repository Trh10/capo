import { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <div className="relative hidden w-1/2 overflow-hidden bg-[#201e1d] lg:flex lg:flex-col lg:justify-between lg:border-r-2 lg:border-border lg:p-12">
        <div className="relative">
          <Logo variant="onDark" className="h-10" />
        </div>

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
            CAPO Studio
          </p>
          <blockquote className="mt-4 text-3xl font-extrabold leading-tight text-background">
            &ldquo;Chaque cours est une porte ouverte sur un nouveau savoir-faire.&rdquo;
          </blockquote>
          <p className="mt-6 text-[#9b9797]">
            Rejoignez une communauté de créatifs passionnés.
          </p>
        </div>

        <div className="relative flex gap-8 border-t border-background/15 pt-8">
          <div>
            <p className="text-2xl font-extrabold text-background">+50</p>
            <p className="text-sm text-[#9b9797]">Cours</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-background">+20</p>
            <p className="text-sm text-[#9b9797]">Professeurs</p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-card px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <Logo variant="primary" className="h-9 lg:hidden" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[.14em] text-primary-deep lg:mt-0">
            Compte
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
