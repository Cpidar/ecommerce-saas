import React, { FC } from "react";
import NcImage from "@/components/common/NcImage";
import { ArrowRightIcon } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

export interface CardCategory4Props {
  className?: string;
  featuredImage?: StaticImageData | string;
  bgSVG?: string;
  name: string;
  desc: string;
  color?: string;
  count?: number;
}

const CardCategory4: FC<CardCategory4Props> = ({
  className = "",
  featuredImage = PLACEHOLDER_IMAGE,
  bgSVG,
  name,
  desc,
  color = "bg-rose-50",
  count,
}) => {
  return (
    <div
      className={`nc-CardCategory4 relative w-full aspect-w-12 aspect-h-11 h-0 rounded-3xl overflow-hidden bg-background group hover:nc-shadow-lg transition-shadow ${className}`}
    >
      <div>
        <div className="absolute bottom-0 right-0 max-w-[280px] opacity-80">
          <Image src={bgSVG || PLACEHOLDER_IMAGE} alt="" />
        </div>

        <div className="absolute inset-5 sm:inset-8 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <NcImage
              alt=""
              src={featuredImage}
              containerClassName={`w-20 h-20 rounded-full overflow-hidden z-0 ${color}`}
              width={80}
              height={80}
            />
            <span className="text-xs text-foreground font-medium">
              {count} products
            </span>
          </div>

          <div className="">
            <span
              className={`block mb-2 text-sm text-muted-foreground`}
            >
              {desc}
            </span>
            <h2 className={`text-2xl sm:text-3xl font-semibold`}>{name}</h2>
          </div>

          <Link
            href={"/collection"}
            className="flex items-center text-sm font-medium group-hover:text-primary-500 transition-colors"
          >
            <span>See Collection</span>
            <ArrowRightIcon className="w-4 h-4 ml-2.5" />
          </Link>
        </div>
      </div>

      <Link href={"/collection"}></Link>
    </div>
  );
};

export default CardCategory4;
