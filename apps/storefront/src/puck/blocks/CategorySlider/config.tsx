import { ComponentConfig } from "@puckeditor/core";
import CategoryShowcase from "./component.client";
import { 
  Laptop, 
  Shirt, 
  Home, 
  Book, 
  Sparkles, 
  Bike,
  ToyBrick, 
     
} from 'lucide-react';
import { StaticImageData } from "next/dist/shared/lib/image-external";

export interface CardCategoryData {
  name: string;
  description: string;
  icon: string | StaticImageData;
  color?: string;
}

type Props = {
  categoryCardType: string;
  heading: string;
  subHeading: string;
  data?: CardCategoryData[];
};

const mockProductCategories: CardCategoryData[] = [
  {
    name: "الکترونیک و دیجیتال",
    description: "محصولات دیجیتال، لوازم جانبی و گجت‌های هوشمند",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@0.321.0/icons/laptop.svg",
    color: "#3B82F6"
  },
  {
    name: "مد و پوشاک",
    description: "پوشاک زنانه، مردانه و کودک، اکسسوری و کیف",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@0.321.0/icons/shirt.svg",
    color: "#EC4899"
  },
  {
    name: "خانه و آشپزخانه",
    description: "لوازم خانگی، دکوراسیون، ظروف و مبلمان",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@0.321.0/icons/home.svg",
    color: "#F59E0B"
  },
  {
    name: "کتاب و محصولات فرهنگی",
    description: "کتاب، مجله، نوشت‌افزار و لوازم تحریر",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@0.321.0/icons/book.svg",
    color: "#8B5CF6"
  },
  {
    name: "زیبایی و سلامت",
    description: "لوازم آرایشی، بهداشتی و مراقبت شخصی",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@0.321.0/icons/sparkles.svg",
    color: "#EF4444"
  },
  {
    name: "ورزش و سفر",
    description: "تجهیزات ورزشی، کوهنوردی و چمدان",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@0.321.0/icons/bike.svg",
    color: "#10B981"
  },
  {
    name: "اسباب‌بازی و کودک",
    description: "اسباب‌بازی، لوازم کودک و سرگرمی",
    icon: "https://cdn.jsdelivr.net/npm/lucide-static@0.321.0/icons/toy.svg",
    color: "#F472B6"
  }
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
  },
  defaultProps: {
    categoryCardType: "card07",
    heading: "",
    subHeading: "",
    data: mockProductCategories,
  },
  render: ({ heading, subHeading, data, categoryCardType }) => {
    return (
      <CategoryShowcase heading={heading} subHeading={subHeading} data={data} />
    );
  },
};
