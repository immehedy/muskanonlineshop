function SkeletonBox({ className = "" }: { className?: string }) {
    return (
      <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />
    );
  }
  
  export function OrderDetailsSkeleton() {
    return (
      <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="mt-3 h-7 w-48" />
          <div className="mt-4 flex flex-wrap gap-2">
            <SkeletonBox className="h-8 w-24" />
            <SkeletonBox className="h-8 w-24" />
            <SkeletonBox className="h-8 w-32" />
          </div>
        </div>
  
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <SkeletonBox className="h-5 w-32" />
              <div className="mt-5 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <SkeletonBox className="h-16 w-16 shrink-0" />
                    <div className="flex-1">
                      <SkeletonBox className="h-4 w-48" />
                      <SkeletonBox className="mt-2 h-3 w-64" />
                      <SkeletonBox className="mt-2 h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
  
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <SkeletonBox className="h-5 w-36" />
              <SkeletonBox className="mt-5 h-20" />
            </div>
          </div>
  
          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-5"
              >
                <SkeletonBox className="h-5 w-32" />
                <SkeletonBox className="mt-5 h-4 w-full" />
                <SkeletonBox className="mt-3 h-4 w-3/4" />
                <SkeletonBox className="mt-3 h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }