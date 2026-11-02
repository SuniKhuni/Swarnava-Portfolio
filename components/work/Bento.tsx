"use client";

import { useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Category, CategoryId, WorkItem } from "@/content/types";
import { cardText, itemRatio } from "@/content/types";
import { TapeLink } from "../chrome/TapeLink";
import { OsdChip } from "../ui/OsdChip";
import { Icon } from "../ui/Icon";

// The slider brings Motion's animation engine; load it as its own chunk, not with the page.
const CompareSlider = dynamic(() => import("./CompareSlider"), {
  loading: () => <div className="bento__slider-wait" aria-hidden="true" />,
});

type Entry = { item: WorkItem; category: Pick<Category, "id" | "label"> };
type Filter = "all" | CategoryId;

/** Selected Works shows up to 12 ticked pieces (the admin asks for 6–12). */
const MAX = 12;

/** One piece at its own shape (16:9, 9:16, 1:1, 4:5 or any other size), never cropped. */
function Tile({ entry }: { entry: Entry }) {
  const { item, category } = entry;
  const text = cardText(item, category.label);
  return (
    <li className="bento__tile" style={{ "--r": itemRatio(item) } as CSSProperties}>
      <TapeLink
        href={`/work/${category.id}?t=${item.slug}`}
        osd={category.label}
        className="bento__link"
        aria-label={[text.title, text.credit].filter(Boolean).join(", ")}
      >
        <span className="bento__media">
          <Image src={item.after.src} alt={item.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" />
        </span>
        <span className="bento__shade" aria-hidden="true" />
        <span className="bento__meta" aria-hidden="true">
          <span className="bento__chips">
            <OsdChip tone="signal">{category.label}</OsdChip>
            {item.views ? <OsdChip tone="ink">{item.views} VIEWS</OsdChip> : null}
          </span>
          <span className="bento__title">{text.title}</span>
          {text.credit ? <span className="bento__client">{text.credit}</span> : null}
        </span>
      </TapeLink>
    </li>
  );
}

/** Interleave the tapes (one from each in turn), so no tape sits next to itself. */
function mix(lists: Entry[][]) {
  const longest = Math.max(0, ...lists.map((l) => l.length));
  return Array.from({ length: longest }).flatMap((_, i) => lists.flatMap((l) => (l[i] ? [l[i]] : [])));
}

/**
 * Selected Works. Default (ALL): only the pieces ticked "Show in Selected Works" in /admin,
 * interleaved across tapes, up to 12. Until anything is ticked, one piece from each tape.
 * A tape's pill shows that tape — its ticked pieces first. Ticked pieces marked for the big
 * slider (and that have a before) form the top row. Every card opens its piece in its tape.
 */
export function Bento({ categories }: { categories: Category[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const live = categories.filter((c) => c.items.length > 0);
  const perTape = live.map((c) => c.items.map((item) => ({ item, category: { id: c.id, label: c.label } })));
  const curated = perTape.some((t) => t.some((e) => e.item.selected));

  let shown: Entry[];
  if (filter === "all") {
    shown = curated ? mix(perTape.map((t) => t.filter((e) => e.item.selected))).slice(0, MAX) : mix(perTape.map((t) => t.slice(0, 1)));
  } else {
    const tape = perTape.find((t) => t[0]?.category.id === filter) ?? [];
    shown = [...tape.filter((e) => e.item.selected), ...tape.filter((e) => !e.item.selected)].slice(0, MAX);
  }
  const featured = shown.filter((e) => e.item.featured && e.item.before && (e.item.selected || !curated));
  const grid = shown.filter((e) => !featured.includes(e));
  const filters: { id: Filter; label: string }[] = [{ id: "all", label: "ALL" }, ...live.map((c) => ({ id: c.id, label: c.label }))];

  return (
    <div className="bento">
      <div className="wrap bento__head">
        <p className="t-osd-lg bento__caption">SELECTED WORKS</p>
        <div className="bento__filters" role="group" aria-label="Filter the work">
          {filters.map((f) => (
            <button key={f.id} type="button" className="bento__filter" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {featured.length > 0 ? (
        <div className="wrap bento__featured">
          {featured.map(({ item, category }) => {
            const text = cardText(item, category.label);
            return (
              <article key={item.slug} className="bento__wide">
                <div className="bento__slider" style={{ "--ratio": itemRatio(item) } as CSSProperties}>
                  <CompareSlider item={item} teach={false} />
                </div>
                <div className="bento__wide-meta">
                  <div>
                    <p className="bento__wide-title">{text.title}</p>
                    <div className="bento__chips">
                      <OsdChip tone="signal">{category.label}</OsdChip>
                      {item.client && text.credit ? <OsdChip tone="paper">{item.client}</OsdChip> : null}
                      {item.views ? <OsdChip tone="ink">{item.views} VIEWS</OsdChip> : null}
                    </div>
                  </div>
                  <TapeLink href={`/work/${category.id}?t=${item.slug}`} osd={category.label} className="bento__more">
                    OPEN THE TAPE <Icon name="arrow-up-right" size="1em" />
                  </TapeLink>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {grid.length > 0 ? (
        <ul className="wrap bento__grid jrows" aria-label="Selected works">
          {grid.map((e) => (
            <Tile key={e.item.slug} entry={e} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
