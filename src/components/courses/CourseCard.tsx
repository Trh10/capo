import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { VideoThumbnail } from "@/components/video/VideoThumbnail";

interface CourseCardProps {
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  price: number;
  level: string;
  teacherName: string;
  lessonCount: number;
  categoryName?: string;
  durationMin?: number;
}

function formatDuration(minutes?: number) {
  if (!minutes) return undefined;
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
  return `${minutes} min`;
}

export function CourseCard({
  slug,
  title,
  thumbnailUrl,
  price,
  level,
  teacherName,
  lessonCount,
  categoryName,
  durationMin,
}: CourseCardProps) {
  const formattedPrice = formatPrice(price);

  return (
    <Link
      href={`/courses/${slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-lg"
    >
      <div className="relative">
        <VideoThumbnail
          src={thumbnailUrl}
          alt={title}
          duration={formatDuration(durationMin)}
          aspect="card"
          className="rounded-none"
        />
        {categoryName && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-card/90 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            {categoryName}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted">{teacherName}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-lg font-bold text-primary">{formattedPrice}</span>
          <span className="text-xs text-muted">
            {lessonCount} leçon{lessonCount > 1 ? "s" : ""} · {level}
          </span>
        </div>
      </div>
    </Link>
  );
}
