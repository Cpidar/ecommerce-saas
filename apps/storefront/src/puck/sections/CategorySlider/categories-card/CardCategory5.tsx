import { cn } from "@/lib/utils/utils";
import { StaticImageData } from "next/image";
import Link from "next/link";
import React, { FC } from "react";

export interface CardCategory1Props {
  className?: string;
  size?: "large" | "normal";
  featuredImage?: string;
  name?: string;
  desc?: string;
  slug: string;
}

const CardCategory5: FC<CardCategory1Props> = ({
  name,
  desc,
  slug,
  featuredImage,
  className,
}) => {
  return (
    <Link href={`/categories/${slug}`} className={cn("group block", className)}>
      <div className="relative aspect-[4/3] sm:aspect-[4/3] rounded-xl overflow-hidden bg-secondary/60 mb-4 ring-1 ring-border/50 group-hover:ring-primary/20 transition-all duration-300">
        <img
          src={featuredImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}

export default CardCategory5;
