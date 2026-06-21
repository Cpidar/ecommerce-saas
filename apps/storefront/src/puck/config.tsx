// puck.config.tsx

import { Config } from "@puckeditor/core";
import { HeroSection } from "./blocks/HeroSection01";
import { HeroSection03 } from "./blocks/hero-sections/TwoColumn";
import { IntroSection } from "./blocks/IntroSection01";
import { ProductTypesSection } from "./blocks/ProductTypeSection01";
import { CollectionsSectionWrapper } from "./blocks/collection-slider/CollectionsSliderSection";
import { AboutSection } from "./blocks/AboutSection";
import { ProductTypeCard } from "./blocks/ProductTypeCard01";
import { InspirationTextSection } from "./blocks/InspirationTextSection";
import { FeaturedProductCard } from "./blocks/FeaturedProductCard";
import { FullWidthImageSection } from "./blocks/FullWidthImageSection";
import { IncredibleOffersSection } from "./blocks/IncredibleOffer/config";
import { Space } from "./blocks/Space";

// Define the root categories for better organization in the editor
export const config: Config = {
  components: {
    // Section Components (main building blocks)
    HeroSection,
    HeroSection03,
    IntroSection,
    ProductTypesSection,
    CollectionsSectionWrapper,
    AboutSection,
    InspirationTextSection,
    IncredibleOffersSection,
    FeaturedProductCard,
    FullWidthImageSection,
    // layout
    Space,
    // Nested Components (can only be placed inside specific sections)
    // ProductTypeCard,
  },

  // Optional: Define root component (what wraps the page)
  root: {
    render: ({ children }: { children: React.ReactNode }) => {
      return <>{children}</>;
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
        "AboutSection",
        "IncredibleOffersSection",
      ],
      title: "Page Sections",
    },
    cards: {
      components: ["ProductTypeCard"],
      title: "Cards & Items",
    },
  },
};

export default config;
