// src/components/skeleton-card.tsx
export default function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden animate-pulse border border-border">
      {/* Image Skeleton */}
      <div className="h-48 bg-muted"></div>
      
      <div className="p-4">
        {/* Title Skeleton */}
        <div className="h-6 bg-muted rounded mb-2"></div>
        
        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
        
        {/* Address Skeleton */}
        <div className="h-4 bg-muted rounded w-5/6 mb-3"></div>
        
        {/* Rating and Category Skeleton */}
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 bg-muted rounded w-20"></div>
          <div className="h-6 bg-muted rounded w-16"></div>
        </div>
        
        {/* Button Skeleton */}
        <div className="h-8 bg-muted rounded w-full"></div>
      </div>
    </div>
  );
}