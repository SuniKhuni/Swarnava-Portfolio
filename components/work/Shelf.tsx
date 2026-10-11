"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useMediaQuery } from "@/lib/hooks";
import { Cassette, type CassetteData } from "./Cassette";

/** Four tapes: 4-up ≥ 1280, 2 × 2 from 768, a snap carousel with dots below (§9.4). */
export function Shelf({ categories }: { categories: CassetteData[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const carousel = useMediaQuery("(max-width: 767px)");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { once: true, margin: "0px 0px -15% 0px" });

  useEffect(() => {
    const el = scroller.current;
    const ul = list.current;
    if (!carousel || !el || !ul) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const centre = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        let dist = Infinity;
        Array.from(ul.children).forEach((li, i) => {
          const c = (li as HTMLElement).offsetLeft + (li as HTMLElement).offsetWidth / 2;
          if (Math.abs(c - centre) < dist) {
            dist = Math.abs(c - centre);
            best = i;
          }
        });
        setActive(best);
      });
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [carousel]);

  const goTo = (i: number) => {
    const el = scroller.current;
    const li = list.current?.children[i] as HTMLElement | undefined;
    if (!el || !li) return;
    el.scrollTo({ left: li.offsetLeft - (el.clientWidth - li.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <div ref={root} className="shelf" data-in={inView}>
      <div ref={scroller} className="shelf__scroller" {...(carousel ? { role: "region", "aria-label": "Project categories", tabIndex: 0 } : {})}>
        <ul ref={list} className="shelf__list">
        {categories.map((c, i) => (
          <li key={c.id} className="shelf__item" style={{ "--i": i } as React.CSSProperties}>
            <Cassette category={c} index={i} active={carousel && active === i} restOut={carousel ? 12 : 0} />
          </li>
        ))}
        </ul>
      </div>
      <div className="shelf__dots">
        {categories.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className="shelf__dot"
            aria-label={c.label}
            aria-current={active === i || undefined}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
