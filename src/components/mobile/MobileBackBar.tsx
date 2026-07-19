"use client";

import { usePathname } from "next/navigation";
import { useMobileNav } from "./MobileNavProvider";

export function MobileBackBar() {
  const pathname = usePathname();
  const { canGoBack, goBack, isNativeApp } = useMobileNav();

  if (!canGoBack) return null;

  return (
    <div
      className={`sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur-sm ${
        isNativeApp ? "" : "md:hidden"
      }`}
    >
      <button
        type="button"
        onClick={goBack}
        aria-label="Retour"
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-foreground/90 transition active:bg-background"
      >
        <svg
          className="h-5 w-5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Retour
      </button>
    </div>
  );
}
