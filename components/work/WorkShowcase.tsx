"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/content/types";
import { WorkGrid, type GridEntry } from "./WorkGrid";
import { OtherTapes } from "./OtherTapes";

const pad = (n: number) => String(n).padStart(2, "0");
const ALL = "all";

/**
 * /work and /work/[tape]: "All designs" and one tab per tape. Tabs filter in place (no page load)
 * and keep the address in step (/work, /work/gaming…). Each tape shows in the order and widths
 * set in /admin; "All designs" shows the tapes one after another, each in its own arrangement.
 * Inside a tape, the other tapes follow the grid, before the contact section.
 */
export function WorkShowcase({ categories, initial, focus }: { categories: Category[]; initial: string; focus?: string }) {
  const live = categories.filter((c) => c.items.length > 0);
  const [tab, setTab] = useState(live.some((c) => c.id === initial) ? initial : ALL);
  const tape = live.find((c) => c.id === tab);

  const entries: GridEntry[] = (tape ? [tape] : live).flatMap((c) => c.items.map((item) => ({ item, category: { id: c.id, label: c.label } })));
  const title = tape ? tape.label : "ALL DESIGNS";

  // Phones: the tab row scrolls sideways — keep the active tab in view.
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = tabs.current;
    const on = row?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (row && on && row.scrollWidth > row.clientWidth) row.scrollLeft = on.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
  }, [tab]);

  const choose = (id: string) => {
    setTab(id);
    window.history.replaceState(window.history.state, "", id === ALL ? "/work" : `/work/${id}`);
  };

  return (
    <>
      <section className="showcase scene" data-scene="night" data-channel="03" data-channel-label={tape ? tape.label : "WORK"} aria-labelledby="showcase-title">
        <header className="wrap showcase__head">
          <h1 id="showcase-title" className="t-section showcase__title">
            {title}
          </h1>
          <p className="t-osd-lg showcase__count">{pad(entries.length)} DESIGNS</p>
        </header>
        <nav className="wrap showcase__tabs" aria-label="Filter the work">
          <div ref={tabs} className="bento__filters" role="group">
            {[{ id: ALL, label: "ALL DESIGNS" }, ...live.map((c) => ({ id: c.id, label: c.label }))].map((t) => (
              <button key={t.id} type="button" className="bento__filter" aria-pressed={tab === t.id} onClick={() => choose(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </nav>
        <div key={tab} className="wrap showcase__grid">
          <WorkGrid entries={entries} mode="view" focus={tab === initial ? focus : undefined} label={tape ? `${tape.label} designs` : "All designs"} />
        </div>
      </section>
      {tape ? <OtherTapes categories={categories} current={tape.id} /> : null}
    </>
  );
}
