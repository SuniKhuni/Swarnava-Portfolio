"use client";

import { useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";

/**
 * Letters rising out of a clipped line, once, when the element reaches 75% of the viewport.
 * The real text stays readable to assistive tech; the split letters are aria-hidden.
 * Without JS (no `html.js`), the letters are simply there.
 */
export function Rise({ text, stagger = "letters" }: { text: string; stagger?: "letters" | "bts" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -25% 0px" });
  return (
    <>
      <span className="sr-only">{text}</span>
      <span
        ref={ref}
        className="rise"
        data-in={inView}
        aria-hidden="true"
        style={stagger === "bts" ? ({ "--rise-stagger": "var(--stagger-bts)" } as CSSProperties) : undefined}
      >
        {Array.from(text).map((ch, i) => (
          <span key={i} style={{ "--i": i } as CSSProperties}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </>
  );
}
