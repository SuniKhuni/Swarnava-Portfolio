"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { WorkItem } from "@/content/types";
import { cardText, itemAspect, itemRatio } from "@/content/types";
import { useReducedMotionSafe } from "@/lib/hooks";
import { OsdChip } from "../ui/OsdChip";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ThumbCard } from "./ThumbCard";
import CompareSlider from "./CompareSlider";

const pad = (n: number) => String(n).padStart(2, "0");

function Chips({ item, credit }: { item: WorkItem; credit: string | null }) {
  return (
    <div className="expanded__chips">
      {item.client && credit ? <OsdChip tone="paper">{item.client}</OsdChip> : null}
      {item.views ? <OsdChip tone="ink">{item.views} VIEWS</OsdChip> : null}
      {item.href ? (
        <a className="expanded__watch" href={item.href} target="_blank" rel="noopener noreferrer">
          WATCH <Icon name="arrow-up-right" size="1em" />
        </a>
      ) : null}
    </div>
  );
}

/** A finished piece on its own, whole, at its own shape — for pieces with no "before". */
function Preview({ item, label, count, onClose, onStep }: { item: WorkItem; label: string; count: number; onClose: () => void; onStep: (d: -1 | 1) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const text = cardText(item, label);
  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="preview"
      style={{ "--ratio": itemRatio(item) } as CSSProperties}
      aria-label={text.title}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onStep(1);
        if (e.key === "ArrowLeft") onStep(-1);
      }}
    >
      <div className="preview__frame" style={{ aspectRatio: itemAspect(item) } as CSSProperties}>
        <Image key={item.slug} src={item.after.src} alt={item.alt} fill sizes="(min-width: 1280px) 1200px, 100vw" priority />
      </div>
      <div className="preview__meta">
        <div>
          <p className="expanded__title">{text.title}</p>
          <Chips item={item} credit={text.credit} />
        </div>
        <div className="preview__nav">
          {count > 1 ? (
            <>
              <Button variant="icon" icon="chevron-left" aria-label="Previous piece" onClick={() => onStep(-1)} />
              <Button variant="icon" icon="chevron-right" aria-label="Next piece" onClick={() => onStep(1)} />
            </>
          ) : null}
          <Button variant="icon" icon="close" aria-label="Close" onClick={() => dialog.current?.close()} />
        </div>
      </div>
    </dialog>
  );
}

/**
 * /work/[category]. The top is the before/after slider, for the pieces that have a "before"
 * (2–3 per tape; a picker switches between them). The gallery under it holds the rest — the
 * finished-only pieces, each at its own shape. Those open on their own, never in the slider.
 */
export function ExpandedView({ items, label, initialSlug }: { items: WorkItem[]; label: string; initialSlug?: string }) {
  const pairs = items.filter((it) => it.before);
  const singles = items.filter((it) => !it.before);
  const deepLinked = items.find((it) => it.slug === initialSlug);

  const [pairIndex, setPairIndex] = useState(() => Math.max(0, pairs.findIndex((it) => it.slug === initialSlug)));
  const [preview, setPreview] = useState<number | null>(() => (deepLinked && !deepLinked.before ? singles.indexOf(deepLinked) : null));
  const [announce, setAnnounce] = useState("");
  const sliderBox = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const pair = pairs[pairIndex];
  const pairText = pair ? cardText(pair, label) : null;

  const setUrl = (slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("t", slug);
    else url.searchParams.delete("t");
    window.history.replaceState(window.history.state, "", url); // no scroll jump, no refetch
  };

  const selectPair = (i: number) => {
    const next = (i + pairs.length) % pairs.length;
    setPairIndex(next);
    setAnnounce(`Now comparing ${cardText(pairs[next], label).title}`);
    setUrl(pairs[next].slug);
    const r = sliderBox.current?.getBoundingClientRect();
    if (r && (r.bottom < 80 || r.top > window.innerHeight - 80)) {
      sliderBox.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
  };
  const openSingle = (i: number) => {
    const next = (i + singles.length) % singles.length;
    setPreview(next);
    setUrl(singles[next].slug);
  };

  return (
    <>
      {pair && pairText ? (
        <>
          <div ref={sliderBox} className="wrap expanded__slider" style={{ "--ratio": itemRatio(pair) } as CSSProperties}>
            <CompareSlider item={pair} priority />
          </div>
          <div className="wrap expanded__meta">
            <div className="expanded__info">
              <p className="expanded__title">{pairText.title}</p>
              <Chips item={pair} credit={pairText.credit} />
            </div>
            {pairs.length > 1 ? (
              <div className="expanded__nav">
                <Button variant="icon" icon="chevron-left" aria-label="Previous before and after" onClick={() => selectPair(pairIndex - 1)} />
                <span className="t-osd-lg expanded__counter" aria-hidden="true">
                  {pad(pairIndex + 1)} / {pad(pairs.length)}
                </span>
                <Button variant="icon" icon="chevron-right" aria-label="Next before and after" onClick={() => selectPair(pairIndex + 1)} />
              </div>
            ) : null}
          </div>
          {pairs.length > 1 ? (
            <div className="wrap expanded__picker" role="group" aria-label="Before and after pieces">
              {pairs.map((it, i) => (
                <ThumbCard key={it.slug} item={it} label={label} selected={i === pairIndex} onSelect={() => selectPair(i)} />
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {singles.length > 0 ? (
        <section className="wrap gallery" aria-labelledby="gallery-title">
          <p id="gallery-title" className="t-osd-lg expanded__caption">
            {pair ? "MORE FROM THIS TAPE" : "ON THIS TAPE"} · {pad(singles.length)}
          </p>
          <ul className="gallery__grid jrows">
            {singles.map((it, i) => {
              const text = cardText(it, label);
              return (
                <li key={it.slug} className="gallery__item" style={{ "--r": itemRatio(it) } as CSSProperties}>
                  <button
                    type="button"
                    className="gallery__btn"
                    data-cursor="VIEW"
                    aria-label={[text.title, text.credit].filter(Boolean).join(", ")}
                    aria-haspopup="dialog"
                    onClick={() => openSingle(i)}
                  >
                    <Image src={it.after.src} alt={it.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" />
                    <span className="gallery__shade" aria-hidden="true" />
                    <span className="gallery__meta" aria-hidden="true">
                      <span className="gallery__title">{text.title}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {preview !== null && singles[preview] ? (
        <Preview
          item={singles[preview]}
          label={label}
          count={singles.length}
          onStep={(d) => openSingle(preview + d)}
          onClose={() => {
            setPreview(null);
            setUrl(pair ? pair.slug : null);
          }}
        />
      ) : null}
    </>
  );
}
