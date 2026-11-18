// app/admin/orders/skeleton.tsx

function SkeletonBox({ className = "" }: { className?: string }) {
    return (
      <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />
    );
  }
  
  export function OrdersSkeleton() {
    return (
      <div className="mx-auto max-w-7xl space-y-5 p-4 pb-10 md:p-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
            <SkeletonBox className="h-11" />
            <SkeletonBox className="h-11" />
            <SkeletonBox className="h-11" />
          </div>
        </section>
  
        <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="border-b border-slate-100 bg-slate-50 p-4">
            <SkeletonBox className="h-4 w-48" />
          </div>
  
          <div className="divide-y divide-slate-100">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="grid grid-cols-7 gap-4 p-5">
                <SkeletonBox className="h-5" />
                <SkeletonBox className="h-5" />
                <SkeletonBox className="h-5" />
                <SkeletonBox className="h-5" />
                <SkeletonBox className="h-5" />
                <SkeletonBox className="h-8" />
                <SkeletonBox className="h-8" />
              </div>
            ))}
          </div>
        </div>
  
        <div className="grid grid-cols-1 gap-3 lg:hidden">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between gap-3">
                <SkeletonBox className="h-6 w-32" />
                <SkeletonBox className="h-7 w-24" />
              </div>
              <SkeletonBox className="mt-4 h-20" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <SkeletonBox className="h-16" />
                <SkeletonBox className="h-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }