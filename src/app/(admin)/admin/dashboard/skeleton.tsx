function SkeletonBox({ className = "" }: { className?: string }) {
    return (
      <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />
    );
  }
  
  export function DashboardSkeleton() {
    return (
      <div className="mx-auto max-w-7xl space-y-5 pb-10">
        {/* Hero Skeleton */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
          <SkeletonBox className="h-4 w-36" />
          <SkeletonBox className="mt-3 h-9 w-72 max-w-full" />
          <SkeletonBox className="mt-3 h-4 w-full max-w-xl" />
  
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SkeletonBox className="h-24" />
            <SkeletonBox className="h-24" />
            <SkeletonBox className="h-24" />
          </div>
        </section>
  
        {/* Stat Cards Skeleton */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <SkeletonBox className="h-3 w-24" />
              <SkeletonBox className="mt-3 h-8 w-20" />
              <SkeletonBox className="mt-2 h-3 w-32" />
            </div>
          ))}
        </section>
  
        {/* Content Skeleton */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2 md:p-5">
            <div className="flex justify-between gap-4">
              <div>
                <SkeletonBox className="h-5 w-40" />
                <SkeletonBox className="mt-2 h-3 w-28" />
              </div>
              <SkeletonBox className="hidden h-10 w-72 sm:block" />
            </div>
  
            <div className="mt-5 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <SkeletonBox className="h-4 w-40" />
                  <SkeletonBox className="mt-3 h-3 w-64 max-w-full" />
                  <div className="mt-4 flex gap-2">
                    <SkeletonBox className="h-7 w-20" />
                    <SkeletonBox className="h-7 w-24" />
                    <SkeletonBox className="h-7 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <SkeletonBox className="h-5 w-36" />
            <SkeletonBox className="mt-2 h-3 w-28" />
  
            <div className="mt-5 space-y-3">
              <SkeletonBox className="h-20" />
              <SkeletonBox className="h-20" />
              <SkeletonBox className="h-20" />
            </div>
          </aside>
        </section>
      </div>
    );
  }