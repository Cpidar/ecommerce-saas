import React, { FC } from "react";
import NcImage from "@/components/common/NcImage";
import Link from "next/link";
import { StaticImageData } from "next/image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

export interface CardCategory1Props {
  className?: string;
  size?: "large" | "normal";
  featuredImage?: string | StaticImageData;
  name?: string;
  desc?: string;
}

const CardCategory1: FC<CardCategory1Props> = ({
  className = "",
  size = "normal",
  name = "نام دسته",
  desc = "",
  featuredImage = PLACEHOLDER_IMAGE,
}) => {
  return (
    <Link
      href={"/collection"}
      className={`nc-CardCategory1 flex items-center ${className}`}
    >
      <NcImage
        alt=""
        containerClassName={`shrink-0 relative ${
          size === "large" ? "w-20 h-20" : "w-12 h-12"
        } rounded-lg mr-4 overflow-hidden`}
        src={featuredImage}
        sizes="(max-width: 640px) 100vw, 40vw"
        fill
      />
      <div>
        <h2
          className={`${
            size === "large" ? "text-lg" : "text-base"
          } nc-card-title text-foreground font-semibold`}
        >
          {name}
        </h2>
        <span
          className={`${
            size === "large" ? "text-sm" : "text-xs"
          } block mt-[2px] text-muted-foreground`}
        >
          {desc}
        </span>
      </div>
    </Link>
  );
};

export default CardCategory1;
