"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { getFallbackHref, isRootPath } from "@/lib/native-app";

interface MobileNavContextValue {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  isNativeApp: boolean;
  canGoBack: boolean;
  goBack: () => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function useMobileNav(): MobileNavContextValue {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return ctx;
}

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const menuOpenRef = useRef(menuOpen);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  const canGoBack = !isRootPath(pathname);

  const goBack = useCallback(() => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    if (!canGoBack) return;

    const fallback = getFallbackHref(pathname);
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  }, [canGoBack, menuOpen, pathname, router]);

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isNativeApp) return;

    let removeListener: (() => void) | undefined;

    void import("@capacitor/app").then(({ App }) => {
      void App.addListener("backButton", () => {
        if (menuOpenRef.current) {
          setMenuOpen(false);
          return;
        }
        if (isRootPath(pathname)) {
          void App.exitApp();
          return;
        }
        goBack();
      }).then((handle) => {
        removeListener = () => void handle.remove();
      });
    });

    return () => removeListener?.();
  }, [goBack, isNativeApp, pathname]);

  useEffect(() => {
    if (!isNativeApp || !canGoBack) return;

    const edgeWidth = 28;
    const minSwipe = 72;

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      if (!touch || touch.clientX > edgeWidth) return;
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }

    function onTouchMove(e: TouchEvent) {
      if (!touchStart.current) return;
      const touch = e.touches[0];
      if (!touch) return;

      const dx = touch.clientX - touchStart.current.x;
      const dy = Math.abs(touch.clientY - touchStart.current.y);

      if (dx > minSwipe && dy < 80) {
        touchStart.current = null;
        goBack();
      }
    }

    function onTouchEnd() {
      touchStart.current = null;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [canGoBack, goBack, isNativeApp]);

  const value = useMemo(
    () => ({
      menuOpen,
      setMenuOpen,
      isNativeApp,
      canGoBack,
      goBack,
    }),
    [canGoBack, goBack, isNativeApp, menuOpen]
  );

  return (
    <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>
  );
}
