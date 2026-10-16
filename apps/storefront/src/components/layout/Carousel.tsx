"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Layout, LayoutColumn } from "@/components/layout/Layout";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel as CarouselRoot,
  CarouselContent,
  CarouselItem,
  useCarousel,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { useEffect, useState } from "react";

export type CarouselProps = {
  heading?: React.ReactNode;
  button?: React.ReactNode;
  arrows?: boolean;
  cardSize?: "small" | "default";
  hero?: boolean;
  children: React.ReactNode[];
} & React.ComponentPropsWithRef<"div">;

// Inner nav buttons that consume carousel context
function CarouselNav() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={`max-md:hidden transition-opacity${!canScrollPrev ? " opacity-50" : ""}`}
        aria-label="Previous"
      >
        <ArrowRight className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={`max-md:hidden transition-opacity${!canScrollNext ? " opacity-50" : ""}`}
        aria-label="Next"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
    </div>
  );
}

export const Carousel: React.FC<CarouselProps> = ({
  heading,
  button,
  arrows = true,
  children,
  className,
  cardSize = "default",
  hero = false,
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api || !hero) return;
    const select = () => setSelected(api.selectedScrollSnap());
    api.on("select", select);
    return () => {
      api.off("select", select);
    };
  }, [api, hero]);
  useEffect(() => {
    if (!api) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      api.reInit({
        duration:
          reduced.matches ||
          document.documentElement.dataset.input === "keyboard"
            ? 0
            : 25,
      });
    update();
    reduced.addEventListener("change", update);
    document.addEventListener("attar-input-change", update);
    return () => {
      reduced.removeEventListener("change", update);
      document.removeEventListener("attar-input-change", update);
    };
  }, [api]);

  return (
    <CarouselRoot
      setApi={setApi}
      onKeyDownCapture={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        event.stopPropagation();
        if (event.key === "ArrowLeft") api?.scrollPrev(true);
        else api?.scrollNext(true);
      }}
      opts={{
        containScroll: "trimSnaps",
        skipSnaps: true,
        active: true,
        direction: "rtl",
        align: "center",
        loop: hero && children?.length > 1,
      }}
      className={`${hero ? "hero-carousel" : "store-carousel"} ${twMerge("overflow-hidden", className)}`}
    >
      <Layout>
        <LayoutColumn className="relative">
          {!hero && (
            <div className="mb-8 md:mb-15 flex max-sm:flex-col justify-between sm:items-center gap-x-10 gap-y-6">
              {heading}
              {(arrows || button) && (
                <div className="flex md:gap-6 shrink-0">
                  {button}
                  {arrows && <CarouselNav />}
                </div>
              )}
            </div>
          )}
          <CarouselContent className="touch-pan-y">
            {React.Children.map(children, (child) => (
              <CarouselItem
                className={
                  hero
                    ? ""
                    : cardSize === "default"
                      ? "basis-[46%] sm:basis-[42%] md:basis-1/3 lg:basis-1/4"
                      : "basis-[33%] sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                }
              >
                {child}
              </CarouselItem>
            ))}
          </CarouselContent>
          {children.length > 1 && (
            <div className="carousel-controls" data-count={children.length}>
              <CarouselPrevious />
              <CarouselNext />
            </div>
          )}
          {/* Page dots stand in for the arrows on phones (app-shell.css). */}
          {hero && children.length > 1 && (
            <div className="carousel-dots" aria-hidden>
              {children.map((_, i) => (
                <span key={i} data-active={i === selected || undefined} />
              ))}
            </div>
          )}
        </LayoutColumn>
      </Layout>
    </CarouselRoot>
  );
};
