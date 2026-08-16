import { Skeleton } from '@/components/ui/skeleton';

const AboutLoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-x-4 md:gap-x-12 sm:container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="col-start-1 lg:col-start-2 xl:col-start-3 col-end-13 lg:col-end-11 xl:col-end-10">
        <Skeleton className="h-8 md:h-10 w-48 mb-16 md:mb-25" />
      </div>

      {/* Blog Body Content */}
      <div className="col-start-1 lg:col-start-2 xl:col-start-3 col-end-13 lg:col-end-10 xl:col-end-9 blog-body">
        <div className="space-y-6">
          {/* First paragraph */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Second paragraph with bold text */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* List items (3 items) */}
          <div className="space-y-3 pr-4">
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded-sm shrink-0 mt-1" />
              <Skeleton className="h-4 w-11/12" />
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded-sm shrink-0 mt-1" />
              <Skeleton className="h-4 w-10/12" />
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded-sm shrink-0 mt-1" />
              <Skeleton className="h-4 w-11/12" />
            </div>
          </div>

          {/* Next paragraph */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Empty paragraph spacer */}
          <div className="h-2"></div>

          {/* Subheading */}
          <Skeleton className="h-6 md:h-7 w-64" />

          {/* Empty paragraph spacer */}
          <div className="h-2"></div>

          {/* Paragraph after subheading */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Section with strong text */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <div className="space-y-3 pr-4">
              {/* Item 1 - WooCommerce vs Nitro */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-48 font-medium" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              {/* Item 2 */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-56 font-medium" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              {/* Item 3 */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-64 font-medium" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              {/* Item 4 */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-52 font-medium" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              {/* Item 5 */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-56 font-medium" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              {/* Item 6 */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-64 font-medium" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              {/* Item 7 */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-60 font-medium" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>

          {/* Final empty paragraph spacer */}
          <div className="h-2"></div>
        </div>
      </div>
    </div>
  );
};

export default AboutLoadingSkeleton;