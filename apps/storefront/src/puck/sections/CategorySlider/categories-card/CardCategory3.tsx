import React, { FC } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { Button } from "@/components/ui/button";

export interface CardCategory3Props {
  className?: string;
  featuredImage?: StaticImageData | string;
  name?: string;
  desc?: string;
  color?: string;
  buttonText?: string;
  href?: string;
}

const CardCategory3: FC<CardCategory3Props> = ({
  className = "",
  featuredImage,
  name,
  desc,
  color = "",
  buttonText = "خرید کنید",
  href = "#",
}) => {
  return (
    <div
      className={`relative w-full aspect-w-16 aspect-h-11 sm:aspect-h-9 h-0 rounded-2xl overflow-hidden group`}
      style={{ backgroundColor: `${color}` }}
    >
      <div>
        <div className="absolute inset-5 sm:inset-8">
          <Image
            alt=""
            src={featuredImage || ""}
            className="absolute end-0 w-1/2 max-w-[260px] h-full object-contain"
            width={200}
            height={200}
          />
        </div>
      </div>
      <span className="opacity-0 group-hover:opacity-40 absolute inset-0 bg-black/10 transition-opacity"></span>

      <div>
        <div className="absolute inset-5 sm:inset-8 flex flex-col">
          <div className="max-w-xs">
            <span className={`block mb-2 text-sm text-slate-700`}>{name}</span>
            {desc && (
              <h2
                className={`text-xl md:text-2xl text-slate-900 font-semibold`}
                dangerouslySetInnerHTML={{ __html: desc }}
              ></h2>
            )}
          </div>
          <div className="mt-auto">
            <Link href={href}>
              <Button variant={"secondary"} size={"default"}>
                {buttonText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCategory3;
