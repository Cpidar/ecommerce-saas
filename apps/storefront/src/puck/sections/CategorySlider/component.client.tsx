"use client";

import { FC, lazy, Suspense } from "react";
import { Category } from "@/types";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

// Lazy load all card components
const CardCategory1 = lazy(() => import("./categories-card/CardCategory1"));
const CardCategory2 = lazy(() => import("./categories-card/CardCategory2"));
const CardCategory3 = lazy(() => import("./categories-card/CardCategory3"));
const CardCategory4 = lazy(() => import("./categories-card/CardCategory4"));
const CardCategory5 = lazy(() => import("./categories-card/CardCategory5"));
const CardCategory6 = lazy(() => import("./categories-card/CardCategory6"));
const CardCategory7 = lazy(() => import("./categories-card/CardCategory7"));

// Loading fallback component
const CardFallback = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full"></div>
);

export interface SectionSliderCategoriesProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  subHeading?: string;
  data?: Category[];
  categoryCardType: string;
}

// Map card types to their corresponding components
const cardComponents: Record<string, FC<any>> = {
  card01: CardCategory1,
  card02: CardCategory2,
  card03: CardCategory3,
  card04: CardCategory4,
  card05: CardCategory5,
  card06: CardCategory6,
  card07: CardCategory7,
};

const SectionSliderCategories: FC<SectionSliderCategoriesProps> = ({
  itemClassName = "",
  categoryCardType = "card07",
  data,
}) => {
  // Get the appropriate card component based on type
  const CardComponent = cardComponents[categoryCardType] || CardCategory7;

  return (
    <>
      {data?.map((item, index) => {
        // Get the base props
        const { thumbnail, name, description, slug, ...rest } = item;

        // Create card props with explicit values and spread the rest
        const cardProps = {
          featuredImage: thumbnail?.url || PLACEHOLDER_IMAGE,
          name: name,
          desc: description,
          slug,
          ...rest, // This won't overwrite the explicit props above
        };

        return (
          <li key={index} className={`glide__slide ${itemClassName}`}>
            <Suspense fallback={<CardFallback />}>
              <CardComponent {...cardProps} />
            </Suspense>
          </li>
        );
      })}
    </>
  );
};

export default SectionSliderCategories;
