"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// Belt-and-suspenders theme keeper. The no-flash script in the root layout sets
// `.dark` on <html> before first paint; this re-asserts it from localStorage on
// every route change, inside useLayoutEffect (runs after commit, BEFORE paint).
// So if anything strips `.dark` during a client navigation, it's restored before
// the browser paints — no dark→light flash. Renders nothing.
export function ThemeSync() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    try {
      const t = localStorage.getItem("theme");
      const dark =
        t === "dark" ||
        (!t && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // ignore
    }
  }, [pathname]);
  return null;
}
