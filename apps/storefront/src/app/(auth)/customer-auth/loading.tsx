import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const LoginSkeleton: React.FC = () => {
  return (
    <section className="h-screen flex items-center justify-center bg-cover bg-[url('/images/bg.png')]">
      <div className="flex-1 sm:w-full sm:max-w-105 px-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col items-center">
              {/* Icon */}
              <Skeleton className="w-14 h-14 rounded-2xl mb-6" />
              
              {/* Form fields */}
              <div className="w-full space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg mt-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LoginSkeleton;