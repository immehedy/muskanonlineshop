"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useCurrentUser } from "@/packages/query/src/hooks/useCurrentUser";

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#207b95]" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="mt-3 text-xl font-black text-red-700">
          Access denied
        </h2>
        <p className="mt-1 text-sm text-red-600">
          Only admin users can access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}