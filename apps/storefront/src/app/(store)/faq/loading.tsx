import { Skeleton } from '@/components/ui/skeleton';

const FaqSkeleton: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Title */}
      <Skeleton className="h-9 w-48" />

      {/* Subtitle */}
      <Skeleton className="mt-4 h-5 w-full max-w-md" />

      {/* Accordion items */}
      <div className="mt-8 space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border-b pb-4">
            <Skeleton className="h-6 w-3/4" />
          </div>
        ))}
      </div>

      {/* CTA box */}
      <div className="mt-12 rounded-lg border bg-neutral-50 p-6 text-center space-y-3">
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-full max-w-sm mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  );
};

export default FaqSkeleton;