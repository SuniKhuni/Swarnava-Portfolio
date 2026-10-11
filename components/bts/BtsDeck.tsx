"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useMotionValueEvent, useTransform } from "motion/react";
import { useMotionStyle } from "@/lib/motion-style";
import { useElementProgress, useSpringValue } from "@/lib/scroll";
import type { BtsPhoto } from "@/content/types";
import { spring } from "@/lib/motion";
import { QUERIES, useMediaQuery } from "@/lib/hooks";
import { Monitor } from "./Monitor";
import { PolaroidStatic } from "./PolaroidStatic";

const pad = (n: number) => String(n).padStart(2, "0");

/** The Monitor and its Polaroids, sliding in from the right as BTS scrolls in (≥ 1024 px). */
// Client-only and below the fold, so it stays out of first-load JS. Until it loads — on the
// server, without JS, and during hydration — the top Polaroid is plain static HTML.
const FirstPhoto = createContext<BtsPhoto | undefined>(undefined);
function StaticTop() {
  return <PolaroidStatic photo={useContext(FirstPhoto)} />;
}
const PolaroidStack = dynamic(() => import("./PolaroidStack"), { ssr: false, loading: StaticTop });

export function BtsDeck({ photos }: { photos: BtsPhoto[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const wide = useMediaQuery(QUERIES.lg);

  // The section (desktop: it pins its screen) — found from the track, which lives inside it.
  const section = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    section.current = ref.current?.closest("section") ?? null;
  }, []);

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
    const n = photos.length;
    if (n < 2) return;
    const next = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    if (next !== step) setStep(next);
  };
  useMotionValueEvent(sectionPin, "change", (p) => wide && deal(p));
  useMotionValueEvent(trackPin, "change", (p) => !wide && deal(p));

  const counter =
    photos.length > 1 ? (
      <span key={index} className="fx-glitch-flash">
        {pad(index + 1)}/{pad(photos.length)}
      </span>
    ) : undefined;

  return (
    // The track covers the whole section, so its scroll progress is the section's.
    <div ref={ref} className="bts__track">
      <div ref={deck} className="bts__deck">
        <Monitor label="BTS" counter={counter} empty={photos.length === 0}>
          <FirstPhoto.Provider value={photos[0]}>
            <PolaroidStack photos={photos} onChange={setIndex} step={step} />
          </FirstPhoto.Provider>
        </Monitor>
      </div>
    </div>
  );
}
