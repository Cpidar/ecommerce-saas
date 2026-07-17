import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-muted/90 py-10">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-6">
          {/* Left Card */}
          <div className="lg:w-2/3 relative overflow-hidden rounded-2xl">
            <div className="relative min-h-[520px] lg:min-h-[620px] bg-muted flex flex-col justify-center p-8 md:p-16">
              <div className="absolute inset-0 bg-black/30 rounded-2xl"></div>{" "}
            </div>
          </div>

          {/* Right Card */}
          <div className="lg:w-1/3 rounded-2xl bg-muted p-8 md:p-16 flex items-center min-h-[520px] lg:min-h-[620px]">
            <div className="relative z-10 max-w-sm space-y-3 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </section>

      {/* Category Slider */}
      <div className="overflow-hidden mt-8">
        <div className="mx-auto grid grid-cols-12 gap-x-4 md:gap-x-12 px-4 sm:container">
          <div className="col-start-1 col-end-13 relative">
            <div className="mb-8 md:mb-15 flex max-sm:flex-col justify-between sm:items-center gap-x-10 gap-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-9 w-24" />
            </div>

            <div className="flex touch-pan-y gap-4 md:gap-10 overflow-hidden">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="m-3.5 h-52 w-40 rounded-xl flex flex-col items-center justify-center text-center bg-muted"
                >
                  <Skeleton className="w-16 h-16 rounded-full mb-3" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingSkeleton;
