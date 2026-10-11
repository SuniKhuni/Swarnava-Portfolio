"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import type { ImageRef } from "@/content/types";
import { timing } from "@/lib/motion";
import { TapeLink } from "../chrome/TapeLink";
import { OsdChip } from "../ui/OsdChip";
import { Icon } from "../ui/Icon";

export type CassetteData = {
  id: string;
  label: string;
  stripe: "orange" | "mustard" | "blue" | "pink";
  cover?: ImageRef;
  count: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

function Reel() {
  return (
    <svg className="reel" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="5" fill="currentColor" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect key={a} x="19" y="6" width="2" height="9" rx="1" fill="currentColor" transform={`rotate(${a} 20 20)`} />
      ))}
    </svg>
  );
}

type CassetteProps = {
  category: CassetteData;
  index: number;
  /** Centred card in the mobile carousel takes the hover state. */
  active?: boolean;
  /** How far the tape rests out of its sleeve: 0 on hover devices, 12% in the carousel. */
  restOut?: number;
};

/** A category as a VHS tape in its sleeve (§7.9). The whole card is one link. */
export function Cassette({ category, index, active = false, restOut = 0 }: CassetteProps) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [ejecting, setEjecting] = useState(false);
  const up = active || hover || focus;
  const empty = category.count === 0;
  const style = { "--stripe": category.stripe === "orange" ? "var(--orange-500)" : `var(--stripe-${category.stripe})` } as CSSProperties;

  const tape = (
    <div
      className="cassette__tape"
      aria-hidden="true"
      data-state={ejecting ? "eject" : up ? "up" : "rest"}
      style={{ "--rest": `-${restOut}%` } as CSSProperties}
    >
      <span className="cassette__spine">
        <span className="cassette__spine-stripe" />
        <span className="cassette__spine-name">{category.label}</span>
        <span className="cassette__spine-meta">E-180</span>
      </span>
      <span className="cassette__window">
        <Reel />
        <Reel />
      </span>
    </div>
  );

  const sleeve = (
    <div className="cassette__sleeve">
      <div className="cassette__cover">
        {empty ? (
          <span className="cassette__soon t-label">COMING SOON</span>
        ) : category.cover ? (
          <Image src={category.cover.src} alt="" fill sizes="(min-width: 1280px) 300px, (min-width: 768px) 45vw, 72vw" />
        ) : (
          <span className="cassette__missing t-label">{category.label}</span>
        )}
      </div>
      <span className="cassette__stripes" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="cassette__title t-title">{category.label}</span>
      <span className="cassette__row">
        <OsdChip tone="paper">{empty ? "NO TAPES" : `${pad(category.count)} TAPES`}</OsdChip>
        {empty ? null : (
          <span className="btn cassette__arrow" data-variant="icon" aria-hidden="true">
            <Icon name="arrow-up-right" className="btn__icon" />
          </span>
        )}
      </span>
      <span className="cassette__index" aria-hidden="true">
        {pad(index + 1)}
      </span>
    </div>
  );

  if (empty) {
    return (
      <div className="cassette" style={style} data-empty aria-disabled="true">
        {tape}
        {sleeve}
      </div>
    );
  }

  return (
    <TapeLink
      href={`/work/${category.id}`}
      osd={category.label}
      className="cassette"
      style={style}
      data-up={up || undefined}
      data-cursor="PLAY"
      aria-label={`${category.label}, ${category.count} pieces`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={(e) => setFocus(e.currentTarget.matches(":focus-visible"))}
      onBlur={() => setFocus(false)}
      beforeNavigate={() =>
        new Promise<void>((resolve) => {
          setEjecting(true);
          setTimeout(resolve, timing.eject * 1000);
        })
      }
    >
      {tape}
      {sleeve}
    </TapeLink>
  );
}
