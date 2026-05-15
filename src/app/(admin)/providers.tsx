"use client";

import { QueryProvider } from "@/packages/query/src/QueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}