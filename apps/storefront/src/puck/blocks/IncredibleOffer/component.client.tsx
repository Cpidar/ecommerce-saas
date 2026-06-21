"use client"

import React, { FC, useEffect, useRef, useState } from "react"
// @ts-ignore
import Glide from "@glidejs/glide/dist/glide.esm"
import Image from "next/image"
import { ChevronLeftIcon } from "lucide-react"
import { Link } from "@/components/ui/Link"

export interface SectionSliderProductCardProps {
  className?: string
  itemClassName?: string
  heading?: string
  handle?: string
  headingFontClassName?: string
  headingClassName?: string
  subHeading?: string
  children: React.ReactNode
}

const SectionIncredibleOffer: FC<SectionSliderProductCardProps> = ({
  className = "",
  headingFontClassName,
  headingClassName,
  heading,
  handle,
  subHeading = "",
  children,
}) => {
  const sliderRef = useRef(null)
  // const { products } = collection

  // const data = products.filter((_, i) => i < 8 && i > 2)
  //
  const [isShow, setIsShow] = useState(false)

  useEffect(() => {
    const OPTIONS: Partial<Glide.Options> = {
      // direction: document.querySelector("html")?.getAttribute("dir") || "ltr",
      perView: 6,
      gap: 32,
      bound: true,
      direction: "rtl",
      breakpoints: {
        1280: {
          perView: 4 - 1,
        },
        1024: {
          gap: 20,
          perView: 4 - 1,
        },
        768: {
          gap: 20,
          perView: 4 - 2,
        },
        640: {
          gap: 20,
          perView: 1.5,
        },
        500: {
          gap: 20,
          perView: 1.3,
        },
      },
    }
    if (!sliderRef.current) return

    let slider = new Glide(sliderRef.current, OPTIONS)
    slider.mount()
    setIsShow(true)
    return () => {
      slider.destroy()
    }
  }, [sliderRef])

  return (
    <section
      className="relative w-full border-b-2 border-red-600 pb-8 lg:rounded-[20px] lg:border-4 lg:p-3 lg:pb-6"
      id="technoOFF_slider_home"
    >
      <div className="relative mb-6 w-full lg:mb-7">
        <Image
          loading="eager"
          src="/assets/images/static_technoffHeader.svg"
          alt="techno off header"
          className="h-full w-full"
          width="1588"
          height="48"
        />
        <div className=" absolute left-[10px] top-1/2 -translate-y-1/2 lg:left-6">
          <Link
            target="_blank"
            className=""
            href={`/collections/${handle}`}
          >
            <div className="flex items-center cursor-pointer">
              <p className="text-xs font-semiBold font-semiBold text-white! lg:text-lg">
                نمایش همه
              </p>
              <ChevronLeftIcon className="text-white w-6 h-6 lg:w-8 lg:h-8" />
            </div>
          </Link>
        </div>
      </div>
      <div ref={sliderRef} className={`flow-root ${isShow ? "" : "invisible"}`}>
        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides pr-4 lg:pr-0 lg:pt-4">
            {children}
            </ul>
        </div>
      </div>
    </section>
  )
}

export default SectionIncredibleOffer

