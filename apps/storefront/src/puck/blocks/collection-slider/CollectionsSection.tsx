import Image from "next/image";
import { Carousel } from "@/components/layout/Carousel";
import { StoreCollection } from "@medusajs/types";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/Link";

export const CollectionsSection: React.FC<{
  className?: string;
  collections: StoreCollection[];
}> = ({ className, collections }) => {
  return (
    <Carousel
      heading={<h3 className="text-md md:text-2xl">Collections</h3>}
      button={
        <>
          <Button
            asChild
            variant={"link"}
            size="lg"
            className="h-full flex-1 max-md:hidden md:h-auto"
          >
            <Link href={"/shop"}>View All</Link>
          </Button>
          <Button asChild variant={"link"} size="sm" className="md:hidden">
            <Link href={"/shop"}>View All</Link>
          </Button>
        </>
      }
      className={className}
    >
      {collections.map((collection) => (
        <div
          className="w-[70%] sm:w-[60%] lg:w-full max-w-124 flex-shrink-0"
          key={collection.id}
        >
          <Link href={`/collections/${collection.handle}`}>
            {typeof collection.metadata?.image === "object" &&
              collection.metadata.image &&
              "url" in collection.metadata.image &&
              typeof collection.metadata.image.url === "string" && (
                <div className="relative mb-4 md:mb-10 w-full aspect-[3/4]">
                  <Image
                    src={collection.metadata.image.url}
                    alt={collection.title}
                    fill
                  />
                </div>
              )}
            <h3 className="md:text-lg mb-2 md:mb-4">{collection.title}</h3>
            {typeof collection.metadata?.description === "string" &&
              collection.metadata?.description.length > 0 && (
                <p className="text-xs text-grayscale-500 md:text-md">
                  {collection.metadata.description}
                </p>
              )}
          </Link>
        </div>
      ))}
    </Carousel>
  );
};
