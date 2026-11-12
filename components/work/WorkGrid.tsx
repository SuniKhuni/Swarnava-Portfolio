"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Category, RowSlot, WorkItem } from "@/content/types";
import { arrangeRows, displayTitle, hasSlider, itemAspect, itemRatio } from "@/content/types";
import { TapeLink } from "../chrome/TapeLink";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

// The slider brings Motion's animation engine: its own chunk, loaded only when a slider is near.
const CompareSlider = dynamic(() => import("./CompareSlider"), {
  loading: () => <span className="wgrid__skeleton" aria-hidden="true" />,
});

export type GridEntry = { item: WorkItem; category: Pick<Category, "id" | "label"> };

/** The accessible name: the title without running numbers, and the tape. */
const nameOf = ({ item, category }: GridEntry) => `${displayTitle(item.title, category.label)} — ${category.label.toLowerCase()}`;

/** Mounts its children once the box is within `margin` of the screen, then keeps them. */
function useNear<T extends Element>(margin = "600px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setNear(true), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [near, margin]);
  return { ref, near };
}

/**
 * The rows, for desktop (up to 3 a row) or tablets (up to 2). "tapes": each tape is arranged on
 * its own, so it reads the same in "All designs" as on its own page. "mix": the list as a whole.
 */
function slotsFor(entries: GridEntry[], flow: "tapes" | "mix", max: 2 | 3): RowSlot[] {
  if (flow === "mix") return arrangeRows(entries.map((e) => e.item), max);
  const out: RowSlot[] = [];
  for (let i = 0; i < entries.length; ) {
    let j = i;
    while (j < entries.length && entries[j].category.id === entries[i].category.id) j++;
    out.push(...arrangeRows(entries.slice(i, j).map((e) => e.item), max));
    i = j;
  }
  return out;
}

/** "first", "last", both or neither: where the piece sits in its row (work.css centres short rows by it). */
const edges = (slot: RowSlot) => [slot.first && "first", slot.last && "last"].filter(Boolean).join(" ") || undefined;

/** The image's rendered width, for the browser to pick a file by: its share of the row at each size. */
const sizesFor = (lg: RowSlot, md: RowSlot) =>
  `(min-width: 1440px) ${Math.ceil(lg.share * 1320)}px, (min-width: 1024px) ${Math.ceil(lg.share * 100)}vw, (min-width: 600px) ${Math.ceil(md.share * 100)}vw, 100vw`;

/** The artwork itself: its own shape, rounded, a skeleton (or blur-up) until it has loaded. */
function Art({ item, sizes, priority }: { item: WorkItem; sizes: string; priority: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const blur = item.after.blur;
  return (
    <span className="wgrid__art" data-loaded={loaded || undefined} data-blur={blur ? "" : undefined} style={{ aspectRatio: itemAspect(item) } as CSSProperties}>
      <Image
        src={item.after.src}
        alt={item.alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder={blur ? "blur" : "empty"}
        blurDataURL={blur}
        draggable={false}
        onLoad={() => setLoaded(true)}
      />
    </span>
  );
}

/** A before/after piece: the slider mounts as it comes near; until then, its After and a skeleton. */
function SliderCell({ entry, priority }: { entry: GridEntry; priority: boolean }) {
  const { ref, near } = useNear<HTMLDivElement>();
  const { item } = entry;
  return (
    <div ref={ref} className="wgrid__slider" style={{ "--ratio": itemRatio(item) } as CSSProperties}>
      {near ? <CompareSlider item={item} priority={priority} /> : <Art item={item} sizes="(min-width: 1280px) 1200px, 100vw" priority={priority} />}
    </div>
  );
}

/** One finished piece, alone and whole, over the page. */
function Preview({ entry, count, onClose, onStep }: { entry: GridEntry; count: number; onClose: () => void; onStep: (d: -1 | 1) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { item } = entry;
  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="preview"
      style={{ "--ratio": itemRatio(item) } as CSSProperties}
      aria-label={nameOf(entry)}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onStep(1);
        if (e.key === "ArrowLeft") onStep(-1);
      }}
    >
      <div className="preview__frame" style={{ aspectRatio: itemAspect(item) } as CSSProperties}>
        <Image key={item.slug} src={item.after.src} alt={item.alt} fill sizes="(min-width: 1280px) 1200px, 100vw" priority placeholder={item.after.blur ? "blur" : "empty"} blurDataURL={item.after.blur} />
      </div>
      <div className="preview__bar">
        {item.href ? (
          <a className="preview__watch" href={item.href} target="_blank" rel="noopener noreferrer">
            WATCH <Icon name="arrow-up-right" size="1em" />
          </a>
        ) : (
          <span />
        )}
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

type WorkGridProps = {
  entries: GridEntry[];
  /** "view": single images open in a preview (a tape, all designs). "link": they open their tape (home). */
  mode: "view" | "link";
  /** A piece to bring into view (and open, if it is a single image) — from ?t=slug. */
  focus?: string;
  label: string;
  /** How rows are worked out: per tape (default), or across the whole list (the home page's mix). */
  flow?: "tapes" | "mix";
};

/**
 * The work grid: whole rows of 1, 2 or 3 pieces (as set in /admin, in the order set there). The
 * pieces in a row share one height and keep their own shapes, so every row fills the line edge to
 * edge whatever the mix — see arrangeRows(). Pieces with the slider switched on are interactive
 * before/afters; everything else is the artwork alone — no titles, badges or counts. Images load
 * lazily over a skeleton or blur-up; sliders mount when near. The layout is plain CSS (work.css):
 * nothing is measured, so nothing moves after the page loads.
 */
export function WorkGrid({ entries, mode, focus, label, flow = "tapes" }: WorkGridProps) {
  const singles = entries.filter((e) => !hasSlider(e.item));
  // ?t=slug on a single image (in "view" mode) opens it straight away.
  const [preview, setPreview] = useState<number | null>(() => {
    if (mode !== "view" || !focus) return null;
    const i = singles.findIndex((e) => e.item.slug === focus);
    return i >= 0 ? i : null;
  });
  const focused = useRef(false);
  const rows = slotsFor(entries, flow, 3);
  const rowsMd = slotsFor(entries, flow, 2);

  const setUrl = (slug: string | null) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("t", slug);
    else url.searchParams.delete("t");
    window.history.replaceState(window.history.state, "", url);
  };
  const open = (i: number) => {
    const next = (i + singles.length) % singles.length;
    setPreview(next);
    setUrl(singles[next].item.slug);
  };

  // ?t=slug: bring the piece into view (behind its preview, if it has one).
  useEffect(() => {
    if (!focus || focused.current) return;
    focused.current = true;
    document.getElementById(`piece-${focus}`)?.scrollIntoView({ block: "center" });
  }, [focus]);

  return (
    <>
      <ul className="wgrid" aria-label={label}>
        {entries.map((entry, i) => {
          const { item, category } = entry;
          const slider = hasSlider(item);
          const priority = i < 2;
          const sizes = sizesFor(rows[i], rowsMd[i]);
          const place = {
            "--i": Math.min(i, 12),
            "--ratio": itemRatio(item).toFixed(4),
            "--k": rows[i].k,
            "--s": rows[i].share.toFixed(5),
            "--sum": rows[i].sum.toFixed(4),
            "--k-md": rowsMd[i].k,
            "--s-md": rowsMd[i].share.toFixed(5),
            "--sum-md": rowsMd[i].sum.toFixed(4),
          } as CSSProperties;
          return (
            <li
              key={`${category.id}/${item.slug}`}
              id={`piece-${item.slug}`}
              className="wgrid__cell"
              data-slider={slider || undefined}
              data-row={edges(rows[i])}
              data-row-md={edges(rowsMd[i])}
              style={place}
            >
              {slider ? (
                <SliderCell entry={entry} priority={priority} />
              ) : mode === "link" ? (
                <TapeLink href={`/work/${category.id}?t=${item.slug}`} osd={category.label} className="wgrid__tile" aria-label={nameOf(entry)} data-cursor="OPEN">
                  <Art item={item} sizes={sizes} priority={priority} />
                </TapeLink>
              ) : (
                <button type="button" className="wgrid__tile" aria-label={nameOf(entry)} aria-haspopup="dialog" data-cursor="VIEW" onClick={() => open(singles.indexOf(entry))}>
                  <Art item={item} sizes={sizes} priority={priority} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {preview !== null && singles[preview] ? (
        <Preview
          entry={singles[preview]}
          count={singles.length}
          onStep={(d) => open(preview + d)}
          onClose={() => {
            setPreview(null);
            setUrl(null);
          }}
        />
      ) : null}
    </>
  );
}
