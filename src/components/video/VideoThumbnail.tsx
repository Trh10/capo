import Image from "next/image";
import Link from "next/link";

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

interface VideoThumbnailProps {
  src?: string | null;
  alt: string;
  duration?: string;
  href?: string;
  aspect?: "video" | "card";
  showPlay?: boolean;
  className?: string;
  onClick?: () => void;
}

export function VideoThumbnail({
  src,
  alt,
  duration,
  href,
  aspect = "video",
  showPlay = true,
  className = "",
  onClick,
}: VideoThumbnailProps) {
  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-[4/3]";

  const content = (
    <div
      className={`group/thumb relative overflow-hidden bg-gradient-to-br from-secondary/20 to-accent/20 ${aspectClass} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition duration-300 group-hover/thumb:scale-105"
          sizes={aspect === "video" ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
        />
      ) : (
        <div className="flex h-full items-center justify-center p-6">
          <Image
            src="/branding/logo-capo-icon.png"
            alt="CAPO Studio"
            width={72}
            height={72}
            className="opacity-40"
          />
        </div>
      )}

      <div className="absolute inset-0 bg-black/20 transition group-hover/thumb:bg-black/35" />

      {showPlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition group-hover/thumb:scale-110 sm:h-16 sm:w-16">
            <PlayIcon className="ml-1 h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        </div>
      )}

      {duration && (
        <span className="absolute bottom-3 right-3 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white">
          {duration}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block overflow-hidden rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}
