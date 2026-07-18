import Link from "next/link";
import { MediaImage } from "@/components/media/MediaImage";

interface LessonVideoItemProps {
  index: number;
  title: string;
  durationMin: number;
  isFree: boolean;
  courseSlug: string;
  lessonSlug: string;
  thumbnailUrl?: string | null;
  locked?: boolean;
}

export function LessonVideoItem({
  index,
  title,
  durationMin,
  isFree,
  courseSlug,
  lessonSlug,
  thumbnailUrl,
  locked = false,
}: LessonVideoItemProps) {
  const href = `/watch/${courseSlug}?lesson=${lessonSlug}`;

  const content = (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/30 hover:shadow-sm sm:gap-4 sm:p-4">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 sm:h-20 sm:w-32">
        {thumbnailUrl && (
          <MediaImage
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="128px"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          {locked ? (
            <svg className="h-5 w-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary">
              <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
        <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 text-[10px] text-white">
          {durationMin} min
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {index}
          </span>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-medium">{title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {isFree && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                  Gratuit
                </span>
              )}
              {locked && (
                <span className="text-xs text-muted">Aperçu 1 min · Acheter pour la suite</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return <Link href={href}>{content}</Link>;
}
