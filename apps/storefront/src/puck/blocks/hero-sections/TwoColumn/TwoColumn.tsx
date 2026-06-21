"use client";

import { FC, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { SectionHeroProps } from ".";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LeafIcon } from "lucide-react";

const AUTO_SLIDE_INTERVAL = 5500;
const PAUSE_AFTER_MANUAL_MS = 1000;

// Placeholder image (you can replace with your own)
const PLACEHOLDER_IMAGE = "/images/products/placeholder.svg"

const SectionHero: FC<SectionHeroProps> = ({
  rightSection: { image: rightMedia, text: rightColumnText },
  leftSection: { text: richText, image: sliderMedia },
}) => {
  console.log(rightMedia, sliderMedia)
  const slides = [{ sliderMedia, richText }];

  // Right media with fallback
  const rightMediaSrc =
    rightMedia && typeof rightMedia === "object" && (rightMedia.src)
      ? `${/* getClientSideURL() */ ""}${rightMedia.src}`
      : PLACEHOLDER_IMAGE;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) =>
      prev >= slides.length - 1 ? 0 : prev + 1
    );
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  }, [slides.length]);

  useEffect(() => {
    if (isAutoPlaying && slides.length > 1) {
      intervalRef.current = setInterval(goToNext, AUTO_SLIDE_INTERVAL);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, goToNext, slides.length]);

  const pauseAutoPlayTemporarily = useCallback(() => {
    setIsAutoPlaying(false);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);

    pauseTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, PAUSE_AFTER_MANUAL_MS);
  }, []);

  const handleNext = () => {
    goToNext();
    pauseAutoPlayTemporarily();
  };

  const handlePrev = () => {
    goToPrev();
    pauseAutoPlayTemporarily();
  };

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentSlide = slides[activeIndex];

  // Left media with fallback
  const leftMediaSrc =
    currentSlide?.sliderMedia && typeof currentSlide.sliderMedia === "object" && 
    (currentSlide.sliderMedia.src)
      ? `${/* getClientSideURL() */ ""}${currentSlide.sliderMedia.src}`
      : PLACEHOLDER_IMAGE;

  return (
    <section className="bg-muted bg-opacity-90 py-10">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-6">
        {/* Left - Sliding Hero */}
        <div className="lg:w-2/3 relative overflow-hidden rounded-2xl">
          <div
            className="relative min-h-130 lg:min-h-155 bg-cover bg-center flex flex-col justify-center p-8 md:p-16"
            style={{ backgroundImage: `url(${leftMediaSrc})` }}
          >
            {/* Optional dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30 rounded-2xl" />

            <div className="relative z-10 max-w-lg">
              {/* Add your title/subtitle from CMS here */}
              {/* <p className="text-white text-4xl md:text-5xl font-semibold leading-tight">
                Your Hero Title
              </p>
              <p className="mt-6 text-white/90 text-lg">
                Your subtitle or description
              </p> */}

              {richText && (
                // <RichText className="text-white mt-6" data={richText} enableGutter={false} />
                <div className="text-white mt-6 prose prose-invert">{richText}</div>
              )}

              <Button size="lg" className="mt-10" asChild>
                <Link href="#">Learn More</Link>
              </Button>
            </div>

            {/* Navigation */}
            {slides.length > 1 && (
              <div className="absolute bottom-8 right-8 flex gap-3 z-20">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handlePrev}
                  className="h-11 w-11 rounded-full bg-white/90 hover:bg-white shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleNext}
                  className="h-11 w-11 rounded-full shadow-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div
          className="lg:w-1/3 rounded-2xl bg-cover bg-center p-8 md:p-16 flex items-center min-h-[520px] lg:min-h-[620px]"
          style={{ backgroundImage: `url(${rightMediaSrc})` }}
        >
          <div className="relative z-10 max-w-sm">
            {rightColumnText ? (
              // <RichText className="text-white" data={rightColumnText} enableGutter={false} />
              <div className="prose prose-invert text-white">{rightColumnText}</div>
            ) : (
              <div className="text-white">
                <p className="text-2xl font-semibold">Right Column Content</p>
                <p className="mt-3 text-white/80">Add your content here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionHero;