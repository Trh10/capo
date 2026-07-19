"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Footer } from "./Footer";

export function NativeAwareFooter() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    setHide(Capacitor.isNativePlatform());
  }, []);

  if (hide) return null;
  return <Footer />;
}
