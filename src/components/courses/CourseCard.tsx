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
      className="group overflow-hidden bg-card transition hover:bg-[#f8f4f4]"
    >
      <div className="relative">
        <div className="grayscale contrast-[1.08]">
          <VideoThumbnail
            src={thumbnailUrl}
            alt={title}
            duration={formatDuration(durationMin)}
            aspect="card"
            className="rounded-none"
          />
        </div>
        {categoryName && (
          <span className="absolute left-0 top-0 z-10 bg-primary px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[.08em] text-background">
            {categoryName}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted">{teacherName}</p>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-border-soft pt-3">
          <span className="text-lg font-extrabold text-primary-deep">
            {formattedPrice}
          </span>
          <span className="text-xs text-muted">
            {lessonCount} leçon{lessonCount > 1 ? "s" : ""} · {level}
            {durationMin ? ` · ${formatDuration(durationMin)}` : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
