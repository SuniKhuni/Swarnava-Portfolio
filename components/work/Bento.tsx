"use client";

import { useState } from "react";
import type { Category, CategoryId } from "@/content/types";
import { WorkGrid, type GridEntry } from "./WorkGrid";

type Filter = "all" | CategoryId;

/** Selected Works shows up to 12 ticked pieces (the admin asks for 6–12). */
const MAX = 12;

/** Interleave the tapes (one from each in turn), so no tape sits next to itself. */
function mix(lists: GridEntry[][]) {
  const longest = Math.max(0, ...lists.map((l) => l.length));
  return Array.from({ length: longest }).flatMap((_, i) => lists.flatMap((l) => (l[i] ? [l[i]] : [])));
}

/**
 * Selected Works, on the home page. ALL: the pieces ticked "Show in Selected Works" in /admin,
 * interleaved across tapes, up to 12 (until anything is ticked, one piece from each tape).
 * A tape's pill shows that tape, ticked pieces first. Each piece keeps the width and slider set
 * in /admin; clicking a single image opens it inside its tape.
 */
export function Bento({ categories }: { categories: Category[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const live = categories.filter((c) => c.items.length > 0);
  const perTape = live.map((c) => c.items.map((item) => ({ item, category: { id: c.id, label: c.label } })));
  const curated = perTape.some((t) => t.some((e) => e.item.selected));

  let shown: GridEntry[];
  if (filter === "all") {
    shown = curated ? mix(perTape.map((t) => t.filter((e) => e.item.selected))).slice(0, MAX) : mix(perTape.map((t) => t.slice(0, 1)));
  } else {
    const tape = perTape.find((t) => t[0]?.category.id === filter) ?? [];
    shown = [...tape.filter((e) => e.item.selected), ...tape.filter((e) => !e.item.selected)].slice(0, MAX);
  }
  const filters = [{ id: "all", label: "ALL" }, ...live.map((c) => ({ id: c.id, label: c.label }))];

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
      <div key={filter} className="wrap showcase__grid">
        <WorkGrid entries={shown} mode="link" label="Selected works" />
      </div>
    </div>
  );
}
