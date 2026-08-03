import Image from "next/image";
import { Carousel } from "@/components/layout/Carousel";
import { StoreCollection } from "@medusajs/types";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/Link";
import { Skeleton } from '@/components/ui/skeleton';

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
          <Link href={`/collections/collections/${collection.handle}`}>
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

export const CollectionSliderSkeleton: React.FC = () => {
  return (
    <div className="overflow-hidden py-10">
      <div className="mx-auto grid grid-cols-12 gap-x-4 md:gap-x-12 px-4 sm:container">
        <div className="col-start-1 col-end-13 relative">
          {/* Header */}
          <div className="mb-8 md:mb-15 flex max-sm:flex-col justify-between sm:items-center gap-x-10 gap-y-6">
            <Skeleton className="h-7 md:h-9 w-32" />
            
            <div className="flex md:gap-6 shrink-0">
              <Skeleton className="h-9 w-24 rounded-lg max-md:hidden" />
              <Skeleton className="h-7 w-16 rounded-lg md:hidden" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-6 rounded-md max-md:hidden" />
                <Skeleton className="h-6 w-6 rounded-md max-md:hidden" />
              </div>
            </div>
          </div>

          {/* Product Cards */}
          <div>
            <div className="flex touch-pan-y gap-4 md:gap-10">
              {Array.from({ length: 4 }).map((_, index) => (
                <div 
                  key={index} 
                  className="w-[50%] sm:w-[40%] lg:w-full max-w-124 shrink-0"
                >
                  <div className="space-y-3">
                    {/* Image placeholder */}
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <Skeleton className="w-full h-full" />
                    </div>
                    
                    {/* Info placeholders */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
