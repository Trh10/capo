import Image from "next/image";
import Link from "next/link";

type LogoVariant = "primary" | "red" | "onDark" | "icon";

const LOGOS: Record<
  LogoVariant,
  { src: string; width: number; height: number; className?: string }
> = {
  /** Texte foncé, fond transparent — header, pages claires */
  primary: {
    src: "/branding/logo-capo-primary.png",
    width: 148,
    height: 51,
  },
  /** Texte blanc, fond transparent — footer, bandeaux sombres */
  red: {
    src: "/branding/logo-capo-on-dark.png",
    width: 148,
    height: 51,
  },
  onDark: {
    src: "/branding/logo-capo-on-dark.png",
    width: 148,
    height: 51,
  },
  icon: {
    src: "/branding/logo-capo-icon.png",
    width: 40,
    height: 40,
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
    <Image
      src={logo.src}
      alt="CAPO Studio"
      width={logo.width}
      height={logo.height}
      priority={priority}
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
