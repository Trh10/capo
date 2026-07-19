import Link from "next/link";

type LogoVariant = "primary" | "red" | "onDark" | "icon";

const LOGOS: Record<
  LogoVariant,
  { src: string; aspectRatio: number; className?: string }
> = {
  /** Texte foncé, fond transparent — header, pages claires */
  primary: {
    src: "/branding/logo-capo-primary.svg",
    aspectRatio: 595.28 / 205.28,
  },
  /** Texte blanc, fond transparent — footer, bandeaux rouges/noirs */
  red: {
    src: "/branding/logo-capo-on-dark.svg",
    aspectRatio: 595.28 / 205.28,
  },
  onDark: {
    src: "/branding/logo-capo-on-dark.svg",
    aspectRatio: 595.28 / 205.28,
  },
  icon: {
    src: "/branding/logo-capo-icon.svg",
    aspectRatio: 1,
  },
};

interface LogoProps {
  variant?: LogoVariant;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

export function Logo({
  variant = "primary",
  href = "/",
  className = "",
  priority = false,
}: LogoProps) {
  const logo = LOGOS[variant];
  const isIcon = variant === "icon";

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.src}
      alt="CAPO Studio"
      width={isIcon ? 40 : 148}
      height={isIcon ? 40 : Math.round(148 / logo.aspectRatio)}
      fetchPriority={priority ? "high" : undefined}
      className={
        isIcon
          ? `h-9 w-9 sm:h-10 sm:w-10 ${logo.className ?? ""} ${className}`
          : `h-8 w-auto sm:h-9 ${logo.className ?? ""} ${className}`
      }
    />
  );

  if (href == null) return image;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
