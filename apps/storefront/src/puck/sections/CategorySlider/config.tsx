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

export const mockProductCategories: Category[] = [
  {
    id: "cat_001",
    name: "الکترونیک و دیجیتال",
    slug: "electronics-digital",
    description: "محصولات دیجیتال، لوازم جانبی و گجت‌های هوشمند",
    thumbnail: {
      url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png",
      alt: "",
    },
    parentId: undefined,
    order: 1,
  },
  {
    id: "cat_002",
    name: "مد و پوشاک",
    slug: "fashion-clothing",
    description: "پوشاک زنانه، مردانه و کودک، اکسسوری و کیف",
    thumbnail: {
      url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png",
      alt: "",
    },
    parentId: undefined,
    order: 2,
  },
  {
    id: "cat_003",
    name: "خانه و آشپزخانه",
    slug: "home-kitchen",
    description: "لوازم خانگی، دکوراسیون، ظروف و مبلمان",
    thumbnail: {
      url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png",
      alt: "",
    },
    parentId: undefined,
    order: 3,
  },
  {
    id: "cat_004",
    name: "کتاب و محصولات فرهنگی",
    slug: "books-culture",
    description: "کتاب، مجله، نوشت‌افزار و لوازم تحریر",
    thumbnail: {
      url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png",
      alt: "",
    },
    parentId: undefined,
    order: 4,
  },
  {
    id: "cat_005",
    name: "زیبایی و سلامت",
    slug: "beauty-health",
    description: "لوازم آرایشی، بهداشتی و مراقبت شخصی",
    thumbnail: {
      url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png",
      alt: "",
    },
    parentId: undefined,
    order: 5,
  },
  {
    id: "cat_006",
    name: "ورزش و سفر",
    slug: "sports-travel",
    description: "تجهیزات ورزشی، کوهنوردی و چمدان",
    thumbnail: {
      url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png",
      alt: "",
    },
    parentId: undefined,
    order: 6,
  },
  {
    id: "cat_007",
    name: "اسباب‌بازی و کودک",
    slug: "toys-kids",
    description: "اسباب‌بازی، لوازم کودک و سرگرمی",
    thumbnail: {
      url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png",
      alt: "",
    },
    parentId: undefined,
    order: 7,
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
        className={className}
        arrows={false}
      >
        <CategoryShowcase
          heading={heading}
          subHeading={subHeading}
          data={(data && data.length < 5) ? data : mockProductCategories}
        />
      </Carousel>
    );
  },
};
