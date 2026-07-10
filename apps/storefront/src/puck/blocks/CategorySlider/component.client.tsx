"use client";

import { FC } from "react";
import CardCategory7 from "./categories-card/CardCategory7";
import { Category } from "@/types";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

export interface SectionSliderCategoriesProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  subHeading?: string;
  data?: Category[];
}

const SectionSliderCategories: FC<SectionSliderCategoriesProps> = ({
  itemClassName = "",
  data,
}) => {
  return (
    <>
      {data?.map((item, index) => (
        <li key={index} className={`glide__slide ${itemClassName}`}>
          <CardCategory7
            featuredImage={item.thumbnail?.url || PLACEHOLDER_IMAGE}
            name={item.name}
            desc={item.description}
          />
        </li>
      ))}
    </>
  );
};

export default SectionSliderCategories;
