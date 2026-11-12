"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useMotionValueEvent, useTransform } from "motion/react";
import { useMotionStyle } from "@/lib/motion-style";
import { useElementProgress, useSpringValue } from "@/lib/scroll";
import type { BtsPhoto } from "@/content/types";
import { spring } from "@/lib/motion";
import { QUERIES, useMediaQuery } from "@/lib/hooks";
import { Icon } from "../ui/Icon";
import { Monitor } from "./Monitor";
import { PersonalArchive } from "./PersonalArchive";

export function BtsDeck({ photos }: { photos: BtsPhoto[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const wide = useMediaQuery(QUERIES.lg);

  // The section (desktop: it pins its screen) — found from the track, which lives inside it.
  const section = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    section.current = ref.current?.closest("section") ?? null;
  }, []);

  // A held screen cannot scroll: if the copy cannot fit the window even with its title at its
  // smallest (a very long about text in a very short window), the section is marked
  // data-fit="no" and bts.css lays it out as an ordinary, scrolling screen instead.
  useLayoutEffect(() => {
    const sec = section.current;
    const copy = sec?.querySelector<HTMLElement>(".bts__copy");
    if (!sec || !copy) return;
    const check = () => {
      delete sec.dataset.fit; // measure in the held layout
      // Layout boxes, not scrollHeight: the title's letters wait below their line until it is in view.
      const last = copy.lastElementChild as HTMLElement | null;
      if (last && last.offsetTop + last.offsetHeight > copy.offsetTop + copy.offsetHeight + 1) sec.dataset.fit = "no";
    };
    check();
    window.addEventListener("resize", check);
    document.fonts?.ready.then(check).catch(() => {});
    return () => window.removeEventListener("resize", check);
  }, [wide]);

  // Slide in as BTS arrives: section pass 0 → 0.16 maps x 28vw → 0 and rotate 6° → −2°.
  const scrollYProgress = useElementProgress(section, "pass"); // ["start end", "end start"]
  const eased = useSpringValue(scrollYProgress, spring.soft);
  const xVw = useTransform(eased, [0, 0.16], [28, 0], { clamp: true });
  const x = useTransform(xVw, (v) => (wide ? `${v}vw` : "0vw"));
  const rotate = useTransform(eased, [0, 0.16], [6, -2], { clamp: true });
  const rot = useTransform(rotate, (v) => (wide ? v : 0));
  const deck = useRef<HTMLDivElement>(null);
  useMotionStyle(deck, { x, rotate: rot });

  // While the screen is pinned, scrolling deals the photos: the pin's scroll split into equal
  // steps, one photo each (desktop: the section pins; phones: the track under the copy pins).
  const sectionPin = useElementProgress(section, "pin");
  const trackPin = useElementProgress(ref, "pin");
  const [step, setStep] = useState(0);
  const deal = (p: number) => {
    const n = Math.max(1, photos.length);
    if (n < 2) return;
    const next = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    if (next !== step) setStep(next);
  };
  useMotionValueEvent(sectionPin, "change", (p) => wide && deal(p));
  useMotionValueEvent(trackPin, "change", (p) => !wide && deal(p));

  const count = Math.max(1, photos.length);

  return (
    // The track covers the whole section, so its scroll progress is the section's.
    <div ref={ref} className="bts__track">
      <div ref={deck} className="bts__deck">
        {/* Phones and tablets, where the Monitor holds alone on screen: viewfinder corners and a REC line. */}
        <span className="bts__finder" aria-hidden="true" />
        <p className="bts__osd bts__osd--top" aria-hidden="true">
          <span>
            <Icon name="rec" size="0.7em" className="bts__osd-rec" /> REC · BEHIND THE SCENES
          </span>
          <span>TAPE 02</span>
        </p>
        <Monitor hideOsd>
          <PersonalArchive photos={photos} step={step} />
        </Monitor>
        {/* How far through the held screen the scroll is: one tick per photo. */}
        {count > 1 ? (
          <p className="bts__osd bts__osd--foot" aria-hidden="true">
            <span className="bts__ticks">
              {Array.from({ length: count }, (_, i) => (
                <i key={i} data-on={i <= step || undefined} />
              ))}
            </span>
            <span>
              SCROLL <Icon name="play" turn={90} size="0.7em" />
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
