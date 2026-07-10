"use client";

import { FC } from "react";
// @ts-ignore
import { Carousel } from "@/components/layout/Carousel";
import CardCategory7 from "./categories-card/CardCategory7";
import { CardCategoryData } from "./config";

export interface SectionSliderCategoriesProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  subHeading?: string;
  data?: CardCategoryData[];
}

const SectionSliderCategories: FC<SectionSliderCategoriesProps> = ({
  heading = "دسته بندی محصولات",
  subHeading = "",
  className = "",
  itemClassName = "",
  data,
}) => {
  return (
    <Carousel
      heading={<h3 className="text-md md:text-2xl">{heading}</h3>}
      className={className}
      arrows={false}
    >
            {data?.map((item, index) => (
              <li key={index} className={`glide__slide ${itemClassName}`}>
                <CardCategory7
                  featuredImage={item.icon}
                  name={item.name}
                  desc={item.description}
                />
              </li>
            ))}
            {/* <li className={`glide__slide ${itemClassName}`}>
              <div
                className={`flex-1 relative w-full h-0 rounded-2xl overflow-hidden group aspect-w-1 aspect-h-1 bg-slate-100`}
              >
                <div>
                  <div className="absolute inset-y-6 inset-x-10 flex flex-col sm:items-center justify-center">
                    <div className="flex relative text-slate-900">
                      <span className="text-lg font-semibold ">
                        More collections
                      </span>
                      <svg
                        className="absolute left-full w-5 h-5 ml-2 rotate-45 group-hover:scale-110 transition-transform"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.0701 9.57L12.0001 3.5L5.93005 9.57"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M12 20.4999V3.66992"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-sm mt-1 text-slate-800">
                      Show me more
                    </span>
                  </div>
                </div>
                <Link
                  href={"/collection"}
                  className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-10 transition-opacity"
                ></Link>
              </div>
            </li> */}
</Carousel>
  );
};

export default SectionSliderCategories;
