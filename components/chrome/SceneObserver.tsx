"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { markChannelHydrated, setEdgeScene, setObservedChannel, type Scene } from "@/lib/channel";

const sceneOf = (el: Element) => ((el as HTMLElement).dataset.scene as Scene) ?? "night";

/**
 * One observer for the whole page: the section crossing the viewport's centre line is the
 * active channel (Remote highlight, HUD channel). Thin bands at the top and bottom edges
 * colour the HUD's two rows. Sections are re-scanned whenever the DOM changes, because a
 * route can commit its loading state first and stream the real page in afterwards.
 */
export function SceneObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const centre = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          setObservedChannel({ number: el.dataset.channel ?? "01", label: el.dataset.channelLabel ?? "", scene: sceneOf(el) });
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    const band = (which: "top" | "bottom", rootMargin: string) =>
      new IntersectionObserver(
        (entries) => {
          for (const entry of entries) if (entry.isIntersecting) setEdgeScene(which, sceneOf(entry.target));
        },
        { rootMargin },
      );
    const top = band("top", "-2% 0px -96% 0px");
    const bottom = band("bottom", "-96% 0px -2% 0px");

    let watched: Element[] = [];
    const scan = () => {
      const sections = Array.from(document.querySelectorAll("[data-channel]"));
      const edges = [...sections, ...Array.from(document.querySelectorAll("footer[data-scene]"))];
      if (edges.length === watched.length && edges.every((el, i) => el === watched[i])) return;
      [centre, top, bottom].forEach((io) => io.disconnect());
      sections.forEach((s) => centre.observe(s));
      edges.forEach((s) => {
        top.observe(s);
        bottom.observe(s);
      });
      watched = edges;
    };

    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    scan();
    markChannelHydrated();
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
      [centre, top, bottom].forEach((io) => io.disconnect());
    };
  }, [pathname]);

  return null;
}
