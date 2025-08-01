// src/components/FacebookPixel.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { pageview } from "@/lib/facebook-pixel";

export default function FacebookPixel() {
  const pathname = usePathname();

  useEffect(() => {
    pageview();
  }, [pathname]);

  return null;
}
