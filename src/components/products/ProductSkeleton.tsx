export default function ProductCardSkeleton() {
    return (
      <div className="relative overflow-hidden rounded-lg border border-gray-100/50 bg-white shadow-sm">
        {/* Favorite button skeleton */}
        <div className="absolute right-1.5 top-1.5 z-30">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        </div>
  
        {/* Image skeleton */}
        <div className="relative aspect-[6/5] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        </div>
  
        {/* Content skeleton */}
        <div className="space-y-2 p-2.5">
          {/* Title */}
          <div className="space-y-1.5">
            <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-7/12 animate-pulse rounded bg-gray-200" />
          </div>
  
          {/* Price */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-12 animate-pulse rounded bg-gray-100" />
          </div>
  
          {/* Rating + View */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-3.5 w-3.5 animate-pulse rounded-sm bg-gray-200"
                  />
                ))}
              </div>
  
              <div className="h-3 w-6 animate-pulse rounded bg-gray-200" />
            </div>
  
            <div className="h-3 w-10 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
  
        {/* Bottom border skeleton */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100" />
      </div>
    );
  }