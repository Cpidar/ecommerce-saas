// configs/components/CollectionsSectionWrapper.ts
import { ComponentConfig } from "@puckeditor/core"
import { CollectionsSection } from "./CollectionsSection"
import { checkboxField } from "../../fields/checkbox"
import { StoreCollection } from "@medusajs/types"

interface CollectionsSectionWrapper {
  showSection: boolean
  data?: StoreCollection[]
}

const mockCollections: StoreCollection[] = [
  {
    id: "col_01H2X5J4K7L9M3N6P8Q2R5T8V1",
    title: "Summer Collection 2024",
    handle: "summer-2024",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-03-20T14:45:00Z",
    deleted_at: null,
    metadata: {
      image: { url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png" }
    },
  },
  {
    id: "col_02H3Y6K5L8M4N7P9Q3R6S9W2",
    title: "Winter Essentials",
    handle: "winter-essentials",
    created_at: "2023-10-05T09:15:00Z",
    updated_at: "2024-01-10T11:20:00Z",
    deleted_at: null,
    metadata: {
      image: { url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png" }
    },
  },
  {
    id: "col_03Z4A7B8C9D1E2F3G4H5I6J7K8",
    title: "Limited Edition Prints",
    handle: "limited-edition-prints",
    created_at: "2024-02-20T16:00:00Z",
    updated_at: "2024-03-25T09:30:00Z",
    deleted_at: null,
    metadata: {
      image: { url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png" }
    },
  },
  {
    id: "col_04W5X6Y7Z8A9B1C2D3E4F5G6H7",
    title: "Clearance Items",
    handle: "clearance",
    created_at: "2023-06-12T08:00:00Z",
    updated_at: "2024-03-28T10:15:00Z",
    deleted_at: "2024-03-29T16:20:00Z", // Example with deleted_at populated
    metadata: {
      image: { url: "/images/content/gray-one-seater-sofa-wooden-coffee-table.png" }
    }, // Example with null metadata
  },
]

export const CollectionsSectionWrapper: ComponentConfig<CollectionsSectionWrapper> =
  {
    label: "نمایش مجموعه ها",
    defaultProps: {
      showSection: true,
      data: mockCollections,
    },
    fields: {
      showSection: {
        label: "Show Section",
        ...checkboxField,
      },
    },
    render: ({ showSection, data, puck: { isEditing } }) => {
      if (!showSection) return <></>
      return (
        <CollectionsSection
          collections={data ? data : mockCollections}
          className="mb-22 md:mb-36"
        />
      )
    },
  }
