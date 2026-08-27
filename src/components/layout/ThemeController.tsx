"use client";

import { useEffect } from "react";

import { useStore } from "@/lib/store/AppStore";

/**
 * Mirrors stored preferences onto the document element. The inline bootstrap
 * script in `layout.tsx` handles the pre-paint case; this keeps the document
 * in sync when preferences change during a session.
 */
export function ThemeController() {
  const { prefs, hydrated } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;

    if (prefs.theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", prefs.theme);

    if (prefs.reduceMotion === "always") root.setAttribute("data-reduce-motion", "always");
    else root.removeAttribute("data-reduce-motion");

    root.setAttribute("lang", prefs.language);
  }, [prefs.theme, prefs.reduceMotion, prefs.language, hydrated]);

  return null;
}

/** True when the reader has asked for reduced motion, by OS or by app toggle. */
export function usePrefersReducedMotion(): boolean {
  const { prefs } = useStore();
  if (prefs.reduceMotion === "always") return true;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
