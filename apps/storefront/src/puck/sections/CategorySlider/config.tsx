import { ComponentConfig } from "@puckeditor/core";
import CategoryShowcase from "./component.client";
import { Category } from "@/types";
import { Carousel } from "@/components/layout/Carousel";

type Props = {
  categoryCardType: string;
  heading: string;
  subHeading: string;
  data?: Category[];
  className?: string;
};

const IMAGE_REMOTE_DOMAIN = "https://nitrocommerce-demo-data.s3.ir-thr-at1.arvanstorage.ir/morrow"

export const mockProductCategories: Category[] = [
  {
    id: "1",
    name: "لوازم ضروری میز کار",
    slug: "desk-essentials",
    description: "محصولات کاربردی که محیط کار شما را پربازده‌تر و زیباتر می‌کنند.",
    thumbnail: {
      url: `${IMAGE_REMOTE_DOMAIN || ''}/categories/desk-essentials.svg`,
      alt: "",
    },
    parentId: undefined,
    order: 1,
  },
  {
    id: "2",
    name: "لوازم جانبی دیجیتال",
    slug: "tech-accessories",
    description: "سازمان‌دهنده‌ها و محافظ‌های هوشمند برای وسایل روزمره دیجیتال شما.",
    thumbnail: {
      url: `${IMAGE_REMOTE_DOMAIN || ''}/categories/tech-accessories.svg`,
      alt: "",
    },
    parentId: undefined,
    order: 2,
  },
  {
    id: "3",
    name: "وسایل سفر",
    slug: "travel-goods",
    description: "کیف و سازمان‌دهنده‌های مقاوم برای سفری آسان و بی‌دغدغه.",
    thumbnail: {
      url: `${IMAGE_REMOTE_DOMAIN || ''}/categories/travel-goods.svg`,
      alt: "",
    },
    parentId: undefined,
    order: 3,
  },
  {
    id: "4",
    name: "وسایل خانه",
    slug: "home-objects",
    description: "سفال، صوتی و وسایل تزئینی که به فضای شما گرما می‌بخشند.",
    thumbnail: {
      url: `${IMAGE_REMOTE_DOMAIN || ''}/categories/home-objects.svg`,
      alt: "",
    },
    parentId: undefined,
    order: 4,
  },
  {
    id: "5",
    name: "کیف و کوله‌پشتی",
    slug: "bags-and-carry",
    description: "کوله‌پشتی و کیف‌های چندمنظوره برای زندگی مدرن روزمره.",
    thumbnail: {
      url: `${IMAGE_REMOTE_DOMAIN || ''}/categories/bags-and-carry.svg`,
      alt: "",
    },
    parentId: undefined,
    order: 5,
  },
  {
    id: "6",
    name: "ابزارهای روزمره",
    slug: "everyday-tools",
    description: "ابزارهای ظریف برای نوشتن، صنایع دستی و ساخت.",
    thumbnail: {
      url: `${IMAGE_REMOTE_DOMAIN || ''}/categories/everyday-tools.svg`,
      alt: "",
    },
    parentId: undefined,
    order: 6,
  },
];

export const CategoriesSlider: ComponentConfig<Props> = {
  label: "نمایش آیکون مجموعه ها",
  fields: {
    categoryCardType: {
      type: "select",
      options: [
        { label: "Card 01", value: "card01" },
        { label: "Card 02", value: "card02" },
        { label: "Card 03", value: "card03" },
        { label: "Card 04", value: "card04" },
        { label: "Card 05", value: "card05" },
        { label: "Card 06", value: "card06" },
        { label: "Card 07", value: "card07" },
      ],
    },
    heading: {
      type: "textarea",
      contentEditable: true,
    },
    subHeading: {
      type: "textarea",
      contentEditable: true,
    },
    className: {
      type: "text",
      visible: false,
    },
  },
  defaultProps: {
    categoryCardType: "card07",
    heading: "",
    subHeading: "",
    data: mockProductCategories,
  },
  render: ({ heading, subHeading, data, categoryCardType, className }) => {
    return (
      <Carousel
        heading={<h3 className="text-md md:text-2xl">{heading}</h3>}
        className={`mx-auto w-full max-w-[1440px] ${className}`}
        arrows={false}
      >
        <CategoryShowcase
          heading={heading}
          subHeading={subHeading}
          data={(data && data.length < 5) ? data : mockProductCategories}
          categoryCardType={categoryCardType}
        />
      </Carousel>
    );
  },
};
