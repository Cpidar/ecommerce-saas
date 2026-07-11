import React, { FC } from "react";
import NcImage from "@/components/common/NcImage";
import Link from "next/link";
import { StaticImageData } from "next/image";

export interface CardCategory2Props {
  className?: string;
  ratioClass?: string;
  bgClass?: string;
  featuredImage?: string | StaticImageData;
  name: string;
  desc: string;
}

const CardCategory2: FC<CardCategory2Props> = ({
  className = "",
  ratioClass = "aspect-w-1 aspect-h-1",
  bgClass = "bg-orange-50",
  featuredImage = ".",
  name,
  desc,
}) => {
  return (
    <Link
      href={"/collection"}
      className={`nc-CardCategory2 ${className}`}
      data-nc-id="CardCategory2"
    >
      <div
        className={`flex-1 relative w-full h-0 rounded-2xl overflow-hidden group ${ratioClass} ${bgClass}`}
      >
        <div className="pt-14">
          <NcImage
            alt=""
            containerClassName="w-full h-full flex justify-center"
            src={featuredImage}
            className="object-cover rounded-2xl"
            sizes="400px"
          />
        </div>
        <span className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-10 transition-opacity rounded-2xl"></span>
      </div>
      <div className="mt-5 flex-1 text-center">
        <h2 className="text-base sm:text-lg text-foreground font-semibold">
          {name}
        </h2>
        <span className="block mt-0.5 sm:mt-1.5 text-sm text-muted-foreground">
          {desc}
        </span>
      </div>
    </Link>
  );
};

export default CardCategory2;
