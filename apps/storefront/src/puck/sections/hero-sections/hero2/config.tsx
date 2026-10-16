import { ComponentConfig } from "@puckeditor/core";
import { Carousel } from "@/components/layout/Carousel";
import { Link } from "@/components/ui/Link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import NcImage from "@/components/ui/NcImage";
import { imagePickerField } from "@/puck/fields/image-picker";
import { StaticImageData } from "next/image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeroSlide = {
  image: StaticImageData | string;
  alt: string;
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type HeroCarouselProps = {
  slides: HeroSlide[];
  autoplay: boolean;
  autoplayInterval: number; // ms
  aspectRatio: "16/9" | "21/9" | "4/3" | "full";
};

// ─── Puck component config ────────────────────────────────────────────────────

export const HeroSection02Config: ComponentConfig<HeroCarouselProps> = {
  label: "هیرو پرفیوم",
  fields: {
    slides: {
      type: "array",
      label: "اسلایدها",
      arrayFields: {
        image: { label: "آدرس تصویر", ...imagePickerField },
        alt: { type: "text", label: "متن جایگزین" },
        headline: { type: "text", label: "عنوان اصلی" },
        subheadline: { type: "text", label: "زیرعنوان" },
        ctaLabel: { type: "text", label: "متن دکمه" },
        ctaHref: { type: "text", label: "لینک دکمه" },
      },
      defaultItemProps: {
        image: PLACEHOLDER_IMAGE,
        alt: "",
        headline: "عنوان اسلاید",
        subheadline: "",
        ctaLabel: "مشاهده",
        ctaHref: "#",
      },
    },
    autoplay: {
      type: "radio",
      label: "پخش خودکار",
      options: [
        { label: "فعال", value: true },
        { label: "غیرفعال", value: false },
      ],
    },
    autoplayInterval: {
      type: "number",
      label: "فاصله زمانی (میلی‌ثانیه)",
    },
    aspectRatio: {
      type: "select",
      label: "نسبت ابعاد",
      options: [
        { label: "16/9", value: "16/9" },
        { label: "21/9", value: "21/9" },
        { label: "4/3", value: "4/3" },
        { label: "تمام صفحه", value: "full" },
      ],
    },
  },
  defaultProps: {
    slides: [
      {
        image: PLACEHOLDER_IMAGE,
        alt: "اسلاید اول",
        headline: "عنوان اصلی محصول",
        subheadline: "توضیحات کوتاه",
        ctaLabel: "خرید کنید",
        ctaHref: "/products",
      },
    ],
    autoplay: false,
    autoplayInterval: 4000,
    aspectRatio: "16/9",
  },
  render: (props) => (
    <section className="hero py-4" aria-label="Featured">
      <Carousel hero>
        {props.slides.map((b, index) => (
          <div className="hero-slide" key={index}>
            <div className="hero-copy">
              {index === 0 ? <h1>{b.headline}</h1> : <h2>{b.headline}</h2>}
              {b.subheadline && <p>{b.subheadline}</p>}
              <div className="hero-actions">
                {b.ctaHref && (
                  <Link className="button primary lg" href={b.ctaHref}>
                    {b.ctaLabel ?? "Shop now"}{" "}
                    <ArrowLeft size={18} aria-hidden />
                  </Link>
                )}
                <Link className="button lg" href="/shop">
                  همه محصولات
                </Link>
              </div>
            </div>
            <NcImage
              containerClassName="hero-media"
              priority={index === 0}
              src={b.image}
              alt={b.headline ?? "Fragrance collection"}
              sizes="(max-width: 800px) 100vw, 55vw"
            />
          </div>
        ))}
      </Carousel>
    </section>
  ),
};
