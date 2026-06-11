"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollToTop — automatically scrolls window to top on every route change.
 * This is a zero-render utility component (returns null).
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Use instant scroll on navigation for snappy feel
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
