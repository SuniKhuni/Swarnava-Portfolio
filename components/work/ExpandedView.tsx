"use client";

import { useRef, useState } from "react";
import type { WorkItem } from "@/content/types";
import { ratioOf } from "@/content/types";
import { useReducedMotionSafe } from "@/lib/hooks";
import { OsdChip } from "../ui/OsdChip";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { MarqueeGroup, MarqueePauseButton, MarqueeRow } from "./MarqueeRow";
import { ThumbCard } from "./ThumbCard";
import CompareSlider from "./CompareSlider";

const pad = (n: number) => String(n).padStart(2, "0");

/** /work/[category]: the slider is the proof; the rows under it change what it shows (§9.6). */
export function ExpandedView({ items, initial }: { items: WorkItem[]; initial: number }) {
  const [index, setIndex] = useState(initial);
  const [announce, setAnnounce] = useState("");
  const sliderBox = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const n = items.length;
  const item = items[index];

  const select = (i: number) => {
    const next = (i + n) % n;
    if (next === index) return;
    setIndex(next);
    setAnnounce(`Now showing ${items[next].title}`);
    const url = new URL(window.location.href);
    url.searchParams.set("t", items[next].slug);
    window.history.replaceState(window.history.state, "", url); // no scroll jump, no refetch
    const r = sliderBox.current?.getBoundingClientRect();
    if (r && (r.bottom < 80 || r.top > window.innerHeight - 80)) {
      sliderBox.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
  };

  const rowA = items.map((it, i) => ({ it, i })).filter(({ i }) => i % 2 === 0);
  const rowB = items.map((it, i) => ({ it, i })).filter(({ i }) => i % 2 === 1);
  const thumbs = (list: { it: WorkItem; i: number }[]) =>
    list.map(({ it, i }) => <ThumbCard key={it.slug} item={it} selected={i === index} onSelect={() => select(i)} />);

  return (
    <>
      <div ref={sliderBox} className="wrap expanded__slider" style={{ "--ratio": ratioOf(item.aspect) } as React.CSSProperties}>
        <CompareSlider item={item} priority />
      </div>

      <div className="wrap expanded__meta">
        <div className="expanded__info">
          <p className="expanded__title">{item.title}</p>
          <div className="expanded__chips">
            {item.client ? <OsdChip tone="paper">{item.client}</OsdChip> : null}
            {item.views ? <OsdChip tone="ink">{item.views} VIEWS</OsdChip> : null}
            {item.href ? (
              <a className="expanded__watch" href={item.href} target="_blank" rel="noopener noreferrer">
                WATCH <Icon name="arrow-up-right" size="1em" />
              </a>
            ) : null}
          </div>
        </div>
        {n > 1 ? (
          <div className="expanded__nav">
            <Button variant="icon" icon="chevron-left" aria-label="Previous piece" onClick={() => select(index - 1)} />
            <span className="t-osd-lg expanded__counter" aria-hidden="true">
              {pad(index + 1)} / {pad(n)}
            </span>
            <Button variant="icon" icon="chevron-right" aria-label="Next piece" onClick={() => select(index + 1)} />
          </div>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {n > 1 ? (
        <MarqueeGroup>
          <div className="wrap expanded__more">
            <p className="t-osd-lg expanded__caption">MORE FROM THIS TAPE</p>
            <MarqueePauseButton what="the rows" />
          </div>
          <div className="band__rows">
            {n <= 4 ? (
              <MarqueeRow label="All pieces" direction={-1} className="band__row">
                {thumbs(items.map((it, i) => ({ it, i })))}
              </MarqueeRow>
            ) : (
              <>
                <MarqueeRow label="Pieces, row 1" direction={-1} className="band__row">
                  {thumbs(rowA)}
                </MarqueeRow>
                <MarqueeRow label="Pieces, row 2" direction={1} className="band__row">
                  {thumbs(rowB)}
                </MarqueeRow>
              </>
            )}
          </div>
        </MarqueeGroup>
      ) : null}
    </>
  );
}
