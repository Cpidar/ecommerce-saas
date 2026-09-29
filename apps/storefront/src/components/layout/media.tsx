import Image from "next/image";
export function Media({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 50vw, 25vw",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`media ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          // Next 16 deprecates `priority`; eager + high fetch priority is the
          // recommended LCP treatment and survives viewport-dependent LCPs.
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          // Demo sandbox uploads (sbx-…) exist only for the visitor's own requests.
          unoptimized={src.endsWith(".svg") || src.startsWith("http") || src.startsWith("/uploads/sbx-")}
        />
      ) : (
        <span className="media-fallback">Image unavailable</span>
      )}
    </div>
  );
}
