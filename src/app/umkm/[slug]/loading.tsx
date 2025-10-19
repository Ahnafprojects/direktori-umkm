// src/app/umkm/[slug]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function UmkmDetailLoading() {
  return (
    <main className="container mx-auto p-4">
      {/* Image Skeleton */}
      <div className="w-full h-64 md:h-96 relative rounded-lg overflow-hidden mb-6">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 rounded-lg border p-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
      </div>
    </main>
  );
}