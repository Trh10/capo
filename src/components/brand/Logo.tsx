import Image from "next/image";
import Link from "next/link";

type LogoVariant = "primary" | "icon" | "light";

const LOGOS: Record<
  LogoVariant,
  { src: string; width: number; height: number; className?: string }
> = {
  primary: {
    src: "/branding/logo-capo-primary.png",
    width: 148,
    height: 40,
  },
  icon: {
    src: "/branding/logo-capo-icon.png",
    width: 40,
    height: 40,
    className: "rounded-xl",
  },
  light: {
    src: "/branding/logo-capo-light.png",
    width: 148,
    height: 40,
  },
};

interface LogoProps {
  variant?: LogoVariant;
  href?: string;
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

  const image = (
    <Image
      src={logo.src}
      alt="CAPO Studio"
      width={logo.width}
      height={logo.height}
      priority={priority}
      className={`h-8 w-auto sm:h-9 ${logo.className ?? ""} ${className}`}
    />
  );

  if (!href) return image;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
