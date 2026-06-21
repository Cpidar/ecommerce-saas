import { Carousel } from "@/components/layout/Carousel";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/Link";
import { Product } from "@/types";

function IncredibleOffers({
  heading = "تخفیفات شگفت انگیز",
  data,
  className,
}: {
  heading: string;
  data: Product[];
  className?: string;
}) {
  return (
    <Carousel
      heading={
        <h3 className="text-md md:text-2xl text-primary-foreground">
          {heading}
        </h3>
      }
      button={
        <>
          <Button
            asChild
            size="lg"
            className="h-full flex-1 max-md:hidden md:h-auto text-primary-foreground"
          >
            <Link href={"/shop"}>View All</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="md:hidden text-primary-foreground"
          >
            <Link href={"/shop"}>View All</Link>
          </Button>
        </>
      }
      className={"bg-primary py-10"}
    >
      {data &&
        data.slice(0, 4)?.map((item, index) => (
          <div
            className="w-[50%] sm:w-[40%] lg:w-full max-w-124 shrink-0"
            key={index}
          >
            <ProductCard product={item} />
          </div>
        ))}
    </Carousel>
  );
}

export default IncredibleOffers;
