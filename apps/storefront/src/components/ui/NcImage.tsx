import React, { FC } from "react";
import Image, { ImageProps } from "next/image";

export interface NcImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: ImageProps["src"] | null;
  alt?: string;
  containerClassName?: string;
  fallbackText?: string;
}

const NcImage: FC<NcImageProps> = ({
  src,
  alt = "nc-image",
  containerClassName = "",
  className = "object-cover w-full h-full",
  fallbackText = "Image unavailable",
  sizes = "(max-width: 640px) 50vw, 25vw",
  priority = false,
  fill,
  width,
  height,
  unoptimized,
  loading,
  fetchPriority,
  ...rest
}) => {
  if (!src) {
    return (
      <div className={`media ${containerClassName}`}>
        <span className="media-fallback">{fallbackText}</span>
      </div>
    );
  }

  // Fill the container unless explicit dimensions were given.
  const useFill = fill ?? (width === undefined && height === undefined);

  // Skip optimization for SVGs, remote URLs and demo sandbox uploads.
  const isString = typeof src === "string";
  const shouldSkipOptimization =
    isString &&
    (src.endsWith(".svg") ||
      src.startsWith("http") ||
      src.startsWith("/uploads/sbx-"));

  return (
    <div className={`media ${containerClassName}`}>
      <Image
        {...rest}
        src={src}
        alt={alt}
        className={className}
        sizes={useFill ? sizes : undefined}
        {...(useFill ? { fill: true } : { width, height })}
        // Next 16 deprecates `priority`; eager + high fetch priority is the
        // recommended LCP treatment.
        loading={priority ? "eager" : loading}
        fetchPriority={priority ? "high" : fetchPriority}
        unoptimized={unoptimized ?? shouldSkipOptimization}
      />
    </div>
  );
};

export default NcImage;
