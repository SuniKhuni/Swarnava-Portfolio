"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { useInView, useMotionValueEvent } from "motion/react";
import { timecode } from "./motion";
import { usePageScroll } from "./scroll";

/** Media query as state. `serverValue` is what SSR and the first client render assume. */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
}

/** A loop may run only while its element is near the viewport and the tab is visible. */
export function useLoopActive(ref: RefObject<Element | null>, margin = "120px") {
  const inView = useInView(ref, { margin: margin as `${number}px` });
  const visible = usePageVisible();
  return inView && visible;
}

const noop = () => () => {};

/** false on the server and during hydration, true afterwards. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Reduced-motion preference that hydrates safely (SSR and first client render assume "no"). */
export function useReducedMotionSafe() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export const QUERIES = {
  finePointer: "(pointer: fine)",
  hover: "(hover: hover)",
  reduced: "(prefers-reduced-motion: reduce)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  /** Every condition the Dive needs — mirrored in hero.css. Any width, any pointer: it is
   *  scroll-linked only. Off for reduced motion and for very short (landscape-phone) viewports. */
  dive: "(min-height: 480px) and (prefers-reduced-motion: no-preference)",
} as const;

/** Writes the tape timecode straight into a DOM node — no React state per frame. */
export function useTimecodeRef<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { progress: scrollYProgress } = usePageScroll();
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (ref.current) ref.current.textContent = timecode(v);
  });
  useEffect(() => {
    if (ref.current) ref.current.textContent = timecode(scrollYProgress.get());
  }, [scrollYProgress]);
  return ref;
}
