// configs/components/AboutSection.ts
import { ComponentConfig } from "@puckeditor/core"
import Image, { StaticImageData } from "next/image"
import { Layout, LayoutColumn } from "@/components/layout/Layout"
import { Link } from "@/components/ui/Link"
import { checkboxField } from "../fields/checkbox"
import { imagePickerField } from "../fields/image-picker"

interface AboutSection {
  showSection: boolean
  title: string
  mainImage: string | StaticImageData
  mainImageAlt: string
  heading: string
  paragraph1: string
  paragraph2: string
  linkText: string
  linkHref: string
}

export const AboutSection: ComponentConfig<AboutSection> = {
  label: "درباره ما",
  defaultProps: {
    showSection: true,
    title: "About Sofa Society",
    mainImage: "/images/content/gray-sofa-against-concrete-wall.png",
    mainImageAlt: "Gray sofa against concrete wall",
    heading:
      "At Sofa Society, we believe that a sofa is the heart of every home.",
    paragraph1:
      "We are dedicated to delivering high-quality, thoughtfully designed sofas that merge comfort and style effortlessly.",
    paragraph2:
      "Our mission is to transform your living space into a sanctuary of relaxation and beauty, with products built to last.",
    linkText: "Read more about Sofa Society",
    linkHref: "/about",
  },
  fields: {
    showSection: {
      label: "Show Section",
      ...checkboxField,
    },
    title: {
      type: "text",
      label: "Section Title",
    },
    mainImage: {
      label: "Main Image",
      ...imagePickerField,
    },
    mainImageAlt: {
      type: "text",
      label: "Main Image Alt Text",
    },
    heading: {
      type: "textarea",
      label: "Heading",
    },
    paragraph1: {
      type: "textarea",
      label: "First Paragraph",
    },
    paragraph2: {
      type: "textarea",
      label: "Second Paragraph",
    },
    linkText: {
      type: "text",
      label: "Link Text",
    },
    linkHref: {
      type: "text",
      label: "Link Href",
    },
  },
  render: ({
    showSection,
    title,
    mainImage,
    mainImageAlt,
    heading,
    paragraph1,
    paragraph2,
    linkText,
    linkHref,
  }: AboutSection) => {
    if (!showSection) return <></>

    return (
      <Layout>
        <LayoutColumn className="col-span-full">
          <h3 className="text-md md:text-2xl mb-8 md:mb-16">{title}</h3>
          <Image
            src={typeof mainImage === "string" ? mainImage : mainImage.src}
            width={2496}
            height={1400}
            alt={mainImageAlt}
            className="mb-8 md:mb-16 max-md:aspect-[3/2] max-md:object-cover"
          />
        </LayoutColumn>
        <LayoutColumn start={1} end={{ base: 13, md: 7 }}>
          <h2 className="text-md md:text-2xl">{heading}</h2>
        </LayoutColumn>
        <LayoutColumn
          start={{ base: 1, md: 8 }}
          end={13}
          className="mt-6 md:mt-19"
        >
          <div className="md:text-md">
            <p className="mb-5 md:mb-9">{paragraph1}</p>
            <p className="mb-5 md:mb-3">{paragraph2}</p>
            <Link href={linkHref} variant="underline">
              {linkText}
            </Link>
          </div>
        </LayoutColumn>
      </Layout>
    )
  },
}
