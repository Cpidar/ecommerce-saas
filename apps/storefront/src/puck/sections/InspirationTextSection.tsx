// app/puck/components/InspirationTextSection.tsx
import { ComponentConfig } from "@puckeditor/core"
import { Layout, LayoutColumn } from "@/components/layout/Layout"
import { checkboxField } from "../fields/checkbox";

interface InspirationTextSectionProps {
  // Editable props
  title: string;
  description: string;
  showSection: boolean;
  
  // Server props (none)
}

export const InspirationTextSection: ComponentConfig<InspirationTextSectionProps> = {
  label: "متن اینسپایریشن",
  fields: {
    title: {
      type: "textarea",
      label: "Title",
      contentEditable: true
    },
    description: {
      type: "textarea",
      label: "Description",
      contentEditable: true
    },
    showSection: {
      label: "Show Section",
      ...checkboxField
    },
  },
  defaultProps: {
    title: "The Astrid Curve sofa is a masterpiece of minimalism and luxury.",
    description: "Our design philosophy revolves around creating pieces that are both beautiful and practical. Inspired by Scandinavian simplicity, modern luxury, and timeless classics.",
    showSection: true,
  },
  render: ({ title, description, showSection }: InspirationTextSectionProps) => {
    if (!showSection) return <></>;
    
    return (
      <Layout>
        <LayoutColumn start={1} end={{ base: 13, md: 8 }}>
          <h3 className="text-md mb-6 md:mb-16 md:text-2xl">{title}</h3>
          <div className="md:text-md max-md:mb-16 max-w-135">
            <p>{description}</p>
          </div>
        </LayoutColumn>
      </Layout>
    );
  },
};