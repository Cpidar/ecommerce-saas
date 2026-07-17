// puck.config.tsx

import { Config } from "@puckeditor/core";
import { HeroSection } from "./sections/HeroSection01";
import { HeroSection03 } from "./sections/hero-sections/TwoColumn/config";
import { IntroSection } from "./sections/IntroSection01";
import { ProductTypesSection } from "./sections/ProductTypeSection01";
import { CollectionsSectionWrapper } from "./sections/collection-slider/config";
import { AboutSection } from "./sections/AboutSection";
import { ProductTypeCard } from "./sections/ProductTypeCard01";
import { InspirationTextSection } from "./sections/InspirationTextSection";
import { FeaturedProductCard } from "./sections/FeaturedProductCard";
import { FullWidthImageSection } from "./sections/FullWidthImageSection";
import { IncredibleOffersSection } from "./sections/IncredibleOffer/config";
import { Space } from "./blocks/Space";
import { CategoriesSlider } from "./sections/CategorySlider/config";
import { CollectionProductsSliderSection } from "./sections/collectionProducts-slider/config";
import { FullPageRichText } from "./sections/FullPageRichText/config";
import { FeaturesSection } from "./sections/FeaturesSections";

// Define the root categories for better organization in the editor
export const config: Config = {
  components: {
    // Section Components (main building blocks)
    HeroSection,
    HeroSection03,
    IntroSection,
    ProductTypesSection,
    CollectionsSectionWrapper,
    CollectionProductsSliderSection,
    CategoriesSlider,
    AboutSection,
    InspirationTextSection,
    IncredibleOffersSection,
    FeaturedProductCard,
    FullWidthImageSection,
    FullPageRichText,
    FeaturesSection,
    // layout
    Space,
    // Nested Components (can only be placed inside specific sections)
    // ProductTypeCard,
  },

  // Optional: Define root component (what wraps the page)
  root: {
    fields: {
desc: {  type: "text"},
    },
    render: ({ children }: { children: React.ReactNode }) => {
      return (<>{children}</>);
    },
  },

  // Optional: Define categories for better UI organization
  categories: {
    layout: {
      components: ["Space"],
      title: "Layout",
    },
    sections: {
      components: [
        "HeroSection",
        "IntroSection",
        "ProductTypesSection",
        "CollectionsSectionWrapper",
        "CategoriesSlider",
        "AboutSection",
        "IncredibleOffersSection",
        "CollectionProductsSliderSection",
        "InspirationTextSection",
        "FeaturedProductCard",
        "FullWidthImageSection",
        "FullPageRichText",
        "FeaturesSection"
      ],
      title: "Page Sections",
    },
    // cards: {
    //   components: ["ProductTypeCard"],
    //   title: "Cards & Items",
    // },
  },
};

export default config;
