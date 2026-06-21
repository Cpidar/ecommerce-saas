// configs/components/IntroSection.ts
import { ComponentConfig } from "@puckeditor/core"
import { Layout, LayoutColumn } from "@/components/layout/Layout"
import { Link } from "@/components/ui/Link"

interface IntroSection {
  title: string
  exploreText: string
  exploreLinkText: string
}

export const IntroSection: ComponentConfig<IntroSection> = {
  label: "متن معرفی",
  defaultProps: {
    title: "Elevate Your Living Space with Unmatched Comfort & Style",
    exploreText: "Discover Your Perfect Sofa Today",
    exploreLinkText: "Explore Now",
  },
  fields: {
    title: {
      type: "textarea",
      label: "Section Title",
    },
    exploreText: {
      type: "text",
      label: "Explore Text",
    },
    exploreLinkText: {
      type: "text",
      label: "Explore Link Text",
    },
  },
  render: ({ title, exploreText, exploreLinkText }: IntroSection) => (
    <Layout className="mb-26 md:mb-36">
      <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
        <h3 className="text-md max-md:mb-6 md:text-2xl">
          {title}
        </h3>
      </LayoutColumn>
      <LayoutColumn start={{ base: 1, md: 9 }} end={13}>
        <div className="flex items-center h-full">
          <div className="md:text-md">
            <p>{exploreText}</p>
            <Link href="/store" variant="underline">
              {exploreLinkText}
            </Link>
          </div>
        </div>
      </LayoutColumn>
    </Layout>
  ),
}