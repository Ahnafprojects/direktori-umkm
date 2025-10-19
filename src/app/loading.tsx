// src/app/loading.tsx
// Ini adalah fallback untuk Suspense di page.tsx
import SkeletonCard from '@/components/skeleton-card';

export default function UmkmGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}