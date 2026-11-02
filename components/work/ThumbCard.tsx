"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import type { WorkItem } from "@/content/types";
import { cardText, displayTitle, itemAspect, itemRatio } from "@/content/types";
import { TapeLink } from "../chrome/TapeLink";
import { OsdChip } from "../ui/OsdChip";

type ThumbCardProps = {
  item: WorkItem;
  /** Showcase: a link to the expanded view. */
  href?: string;
  osd?: string;
  /** Expanded view: a button that loads the item into the slider. */
  onSelect?: () => void;
  selected?: boolean;
  /** The tape's name: tidies the title ("Gaming 01" → "Client – Gaming"). */
  label?: string;
};

// Rows are at most 216 px tall; request at most that height × the item's own ratio.
const sizesFor = (item: WorkItem) => `${Math.ceil(216 * itemRatio(item))}px`;

/** One piece of work in a row. Height from the row, width from the item's aspect (§7.10). */
export function ThumbCard({ item, href, osd, onSelect, selected = false, label }: ThumbCardProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const text = label ? cardText(item, label) : { title: displayTitle(item.title), credit: item.client ?? null };
  const name = [text.title, text.credit].filter(Boolean).join(", ");
  const style = { aspectRatio: itemAspect(item) } as CSSProperties;

  const body = (
    <>
      <span className="thumb__media" data-loaded={loaded || undefined}>
        {failed ? (
          <span className="thumb__fail t-osd">NO SIGNAL</span>
        ) : (
          <Image
            src={item.after.src}
            alt={item.alt}
            fill
            sizes={sizesFor(item)}
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
      </span>
      {item.views ? (
        <OsdChip tone="ink" className="thumb__views">
          {item.views} VIEWS
        </OsdChip>
      ) : null}
      {selected ? (
        <OsdChip key={item.slug} tone="signal" className="thumb__now fx-glitch-once">
          NOW PLAYING
        </OsdChip>
      ) : null}
      <span className="thumb__caption" aria-hidden="true">
        {text.title}
      </span>
    </>
  );

  if (href) {
    return (
      <TapeLink href={href} osd={osd} className="thumb" style={style} aria-label={name} data-cursor="VIEW" data-marquee-item draggable={false}>
        {body}
      </TapeLink>
    );
  }
  return (
    <button
      type="button"
      className="thumb"
      style={style}
      aria-label={name}
      aria-current={selected || undefined}
      data-selected={selected || undefined}
      data-cursor="VIEW"
      data-marquee-item
      onClick={onSelect}
    >
      {body}
    </button>
  );
}
