// components/sections/HeroCarousel.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Carousel as CarouselRoot,
  CarouselContent,
  CarouselItem,
  useCarousel,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HeroCarouselProps } from "./config";

// ─── Inner nav — consumes useCarousel context ─────────────────────────────────

function HeroNav({
  slideCount,
  api,
}: {
  slideCount: number;
  api: CarouselApi | undefined;
}) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <>
      {/* Arrow controls */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="اسلاید قبلی"
        className="
          absolute right-4 top-1/2 z-10 -translate-y-1/2
          flex h-11 w-11 items-center justify-center rounded-full
          bg-white/20 backdrop-blur-sm border border-white/30
          text-white transition-colors duration-150
          hover:bg-white/35 active:scale-95
          disabled:pointer-events-none disabled:opacity-30
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-white
        "
      >
        <ArrowRight className="h-5 w-5" />
      </button>

      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="اسلاید بعدی"
        className="
          absolute left-4 top-1/2 z-10 -translate-y-1/2
          flex h-11 w-11 items-center justify-center rounded-full
          bg-white/20 backdrop-blur-sm border border-white/30
          text-white transition-colors duration-150
          hover:bg-white/35 active:scale-95
          disabled:pointer-events-none disabled:opacity-30
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-white
        "
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      {slideCount > 1 && (
        <div
          role="tablist"
          aria-label="انتخاب اسلاید"
          className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2"
        >
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`اسلاید ${i + 1}`}
              onClick={() => api?.scrollTo(i)}
              className={`
                h-2 rounded-full transition-all duration-200
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-white
                ${i === current ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}
              `}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ─── Aspect-ratio map ─────────────────────────────────────────────────────────

const aspectClasses: Record<HeroCarouselProps["aspectRatio"], string> = {
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  "4/3": "aspect-[4/3]",
  full: "h-screen",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function HeroCarousel({
  slides = [],
  autoplay = false,
  autoplayInterval = 4000,
  aspectRatio = "16/9",
}: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();

  // Autoplay
  useEffect(() => {
    if (!autoplay || !api) return;
    const id = setInterval(() => {
      if (!api.canScrollNext()) {
        api.scrollTo(0);
      } else {
        api.scrollNext();
      }
    }, autoplayInterval);
    return () => clearInterval(id);
  }, [autoplay, autoplayInterval, api]);

  if (!slides.length) return null;

  return (
    <section
      dir="rtl"
      aria-label="اسلایدر اصلی"
      className="relative w-full overflow-hidden"
    >
      <CarouselRoot
        opts={{ direction: "rtl", align: "center", loop: autoplay }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="mr-0">
          {slides.map((slide, i) => (
            <CarouselItem key={i} className="pr-0">
              <div className={`relative w-full ${aspectClasses[aspectRatio]}`}>
                {/* Background image */}
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />

                {/* Gradient overlay */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"
                />

                {/* Text content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-6 text-center text-white">
                  <h2 className="text-3xl font-bold leading-snug drop-shadow sm:text-5xl">
                    {slide.headline}
                  </h2>

                  {slide.subheadline && (
                    <p className="mt-3 max-w-xl text-base text-white/85 drop-shadow sm:text-lg">
                      {slide.subheadline}
                    </p>
                  )}

                  {slide.ctaLabel && slide.ctaHref && (
                    <Link
                      href={slide.ctaHref}
                      className="
                        mt-6 inline-flex h-11 items-center rounded-full
                        bg-white px-7 text-sm font-semibold text-neutral-900
                        shadow-md transition-colors duration-150
                        hover:bg-white/90 active:scale-95
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-white
                      "
                    >
                      {slide.ctaLabel}
                    </Link>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Nav rendered inside CarouselRoot so useCarousel context is available */}
        <HeroNav slideCount={slides.length} api={api} />
      </CarouselRoot>
    </section>
  );
}
