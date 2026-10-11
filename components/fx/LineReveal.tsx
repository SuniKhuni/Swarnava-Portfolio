"use client";

import { Fragment, useLayoutEffect, useRef, type ReactNode } from "react";
import { useInView } from "motion/react";

/**
 * Paragraphs that reveal line by line, once, when in view (clip + y 12 px → 0, 70 ms stagger).
 * Lines are found after layout by grouping words on their offsetTop, and re-measured on
 * resize until the reveal has played. `after` renders below and starts when the lines finish.
 */
export function LineReveal({ paragraphs, className, after }: { paragraphs: string[]; className?: string; after?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || inView) return;
    const measure = () => {
      let line = -1;
      let lastTop = Number.NaN;
      root.querySelectorAll<HTMLElement>(".line-reveal__w").forEach((w) => {
        const top = w.offsetTop;
        if (top !== lastTop) {
          line++;
          lastTop = top;
        }
        w.style.setProperty("--line", String(line));
      });
      root.style.setProperty("--lines", String(line + 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [paragraphs, inView]);

  return (
    <div ref={ref} className="line-reveal" data-in={inView}>
      {paragraphs.map((p, pi) => {
        const words = p.split(/\s+/).filter(Boolean);
        return (
          <p key={pi} className={className}>
            {words.map((w, i) => (
              <Fragment key={i}>
                <span className="line-reveal__w">{w}</span>
                {i < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </p>
        );
      })}
      {after ? <div className="line-reveal__after">{after}</div> : null}
    </div>
  );
}
