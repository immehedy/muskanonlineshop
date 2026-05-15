"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import ProductGrid from "@/components/products/ProductGrid";
import ProductSkeleton from "@/components/products/ProductSkeleton";
import { useEffect, useRef } from "react";

const LIMIT = 8;

async function fetchProducts({ pageParam = 0 }) {
  const res = await fetch(`/api/products?limit=${LIMIT}&skip=${pageParam}`);

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export default function InfiniteProducts({ initialData }: any) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["products"],
      queryFn: fetchProducts,
      initialPageParam: 0,

      getNextPageParam: (lastPage) => {
        const nextSkip = lastPage.skip + lastPage.limit;

        return nextSkip < lastPage.total ? nextSkip : undefined;
      },

      initialData,
      staleTime: 1000 * 60 * 5,
    });

  const products = data?.pages?.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.5,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <>
      <ProductGrid products={products} />

      {/* Skeleton Loader */}
      {isFetchingNextPage && (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Intersection trigger */}
      <div ref={loaderRef} className="h-10" />
    </>
  );
}
