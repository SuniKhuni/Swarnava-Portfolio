"use client";

import { useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Category, CategoryId, WorkItem } from "@/content/types";
import { ratioOf } from "@/content/types";
import { TapeLink } from "../chrome/TapeLink";
import { OsdChip } from "../ui/OsdChip";
import { Icon } from "../ui/Icon";

// The slider brings Motion's animation engine; load it as its own chunk, not with the page.
const CompareSlider = dynamic(() => import("./CompareSlider"), {
  loading: () => <div className="bento__slider-wait" aria-hidden="true" />,
});

type Entry = { item: WorkItem; category: Pick<Category, "id" | "label"> };
type Filter = "all" | CategoryId;

/** How many grid pieces each filter shows on the home page (the full tapes live on /work). */
const GRID_MAX = 10;

function Tile({ entry, index }: { entry: Entry; index: number }) {
  const { item, category } = entry;
  return (
    <li className="bento__tile" data-shape={index % 5 === 0 ? "hero" : index % 5 < 3 ? "small" : "half"}>
      <TapeLink href={`/work/${category.id}`} className="bento__link" aria-label={[item.title, item.client, category.label].filter(Boolean).join(", ")}>
        <span className="bento__media">
          <Image src={item.after.src} alt={item.alt} fill sizes="(min-width: 1024px) 66vw, 100vw" />
        </span>
        <span className="bento__shade" aria-hidden="true" />
        <span className="bento__meta" aria-hidden="true">
          <span className="bento__chips">
            <OsdChip tone="signal">{category.label}</OsdChip>
            {item.views ? <OsdChip tone="ink">{item.views} VIEWS</OsdChip> : null}
          </span>
          <span className="bento__title">{item.title}</span>
          {item.client ? <span className="bento__client">{item.client}</span> : null}
        </span>
      </TapeLink>
    </li>
  );
}

/** Selected work: filter pills; the featured before/afters full-width on top, then a bento grid. */
export function Bento({ categories }: { categories: Category[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const live = categories.filter((c) => c.items.length > 0);
  // Round-robin across the tapes, so ALL shows every niche near the top.
  const perTape = live.map((c) => c.items.map((item) => ({ item, category: { id: c.id, label: c.label } })));
  const entries: Entry[] = Array.from({ length: Math.max(0, ...perTape.map((t) => t.length)) }).flatMap((_, i) => perTape.flatMap((t) => (t[i] ? [t[i]] : [])));
  const shown = filter === "all" ? entries : entries.filter((e) => e.category.id === filter);
  const featured = shown.filter((e) => e.item.featured && e.item.before);
  const grid = shown.filter((e) => !featured.includes(e)).slice(0, GRID_MAX);
  const filters: { id: Filter; label: string }[] = [{ id: "all", label: "ALL" }, ...live.map((c) => ({ id: c.id, label: c.label }))];

  return (
    <div className="bento">
      <div className="wrap bento__head">
        <p className="t-osd-lg bento__caption">SELECTED WORK</p>
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
          {featured.map(({ item, category }) => (
            <article key={item.slug} className="bento__wide">
              <div className="bento__slider" style={{ "--ratio": ratioOf(item.aspect) } as CSSProperties}>
                <CompareSlider item={item} teach={false} />
              </div>
              <div className="bento__wide-meta">
                <div>
                  <p className="bento__wide-title">{item.title}</p>
                  <div className="bento__chips">
                    <OsdChip tone="signal">{category.label}</OsdChip>
                    {item.client ? <OsdChip tone="paper">{item.client}</OsdChip> : null}
                    {item.views ? <OsdChip tone="ink">{item.views} VIEWS</OsdChip> : null}
                  </div>
                </div>
                <TapeLink href={`/work/${category.id}`} className="bento__more">
                  OPEN THE TAPE <Icon name="arrow-up-right" size="1em" />
                </TapeLink>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <ul className="wrap bento__grid" aria-label="More work">
        {grid.map((e, i) => (
          <Tile key={e.item.slug} entry={e} index={i} />
        ))}
      </ul>
    </div>
  );
}
