// configs/components/IntroSection.ts
import { Layout, LayoutColumn } from "@/components/layout/Layout";
import { ComponentConfig } from "@puckeditor/core";

interface FullPageRichText {
  title: string;
  body: string;
}

export const FullPageRichText: ComponentConfig<FullPageRichText> = {
  label: "متن تمام صفحه",
  fields: {
    title: {
      type: "text",
      contentEditable: true,
    },
    body: {
      type: "richtext",
      contentEditable: true,
      //   tiptap: {
      //     extensions: [],
      //   },
    },
  },
  render: ({ body, title }) => (
    <Layout className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 11, xl: 10 }}
      >
        <h1 className="text-lg md:text-2xl mb-16 md:mb-25 font-bold">
          {title}
        </h1>
      </LayoutColumn>
      <LayoutColumn
        start={{ base: 1, lg: 2, xl: 3 }}
        end={{ base: 13, lg: 10, xl: 9 }}
        className="blog-body"
      >
        {body}
      </LayoutColumn>
    </Layout>
  ),
};
