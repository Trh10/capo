import Image, { type ImageProps } from "next/image";

type MediaImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
};

/** Affiche les fichiers /uploads/ en <img> natif (Next/Image renvoie 400 sur ces URLs). */
export function isUploadMediaUrl(src?: string | null): boolean {
  if (!src) return false;
  return src.startsWith("/uploads/") || src.includes("/uploads/");
}

export function MediaImage({
  src,
  alt,
  fill,
  className,
  sizes,
  width,
  height,
  priority,
  ...rest
}: MediaImageProps) {
  if (!src) return null;

  if (isUploadMediaUrl(src)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 h-full w-full ${className ?? ""}`}
          loading={priority ? "eager" : "lazy"}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      width={width}
      height={height}
      priority={priority}
      {...rest}
    />
  );
}
