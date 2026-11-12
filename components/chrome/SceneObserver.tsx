"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { markChannelHydrated, setEdgeScene, setObservedChannel, type Scene } from "@/lib/channel";

const sceneOf = (el: Element) => ((el as HTMLElement).dataset.scene as Scene) ?? "night";

/**
 * One observer for the whole page: the section crossing the viewport's centre line is the
 * active channel (Remote highlight, HUD channel). A scene with no channel of its own (the footer,
 * "check other tapes") counts as the channel before it, so landing straight on one — the End key,
 * a reload at the bottom of the page — still lights the right channel. Thin bands at the top and bottom edges
 * colour the HUD's two rows — from every scene on the page, channel or not, so the HUD never
 * keeps the last section's ink over the next one. Sections are re-scanned whenever the DOM
 * changes, because a route can commit its loading state first and stream the real page in
 * afterwards.
 */
export function SceneObserver() {
  const pathname = usePathname();

  useEffect(() => {
    let channels: HTMLElement[] = [];
    // The channel a scene belongs to: itself, or the last channel section before it in the page.
    const channelOf = (el: HTMLElement) =>
      el.dataset.channel ? el : [...channels].reverse().find((c) => c.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    const centre = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = channelOf(entry.target as HTMLElement);
          if (el) setObservedChannel({ number: el.dataset.channel ?? "01", label: el.dataset.channelLabel ?? "", scene: sceneOf(entry.target) });
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
      const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-channel], section[data-scene], footer[data-scene]"));
      if (scenes.length === watched.length && scenes.every((el, i) => el === watched[i])) return;
      [centre, top, bottom].forEach((io) => io.disconnect());
      channels = scenes.filter((el) => el.dataset.channel);
      scenes.forEach((s) => {
        centre.observe(s);
        top.observe(s);
        bottom.observe(s);
      });
      watched = scenes;
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
