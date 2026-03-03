"use client";

import { useEffect } from "react";

export function useInfiniteScroll(
  containerRef: React.RefObject<HTMLDivElement>,
  onTopReached: () => void
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleScroll() {
      if (el.scrollTop <= 50) {
        onTopReached();
      }
    }

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [containerRef, onTopReached]);
}