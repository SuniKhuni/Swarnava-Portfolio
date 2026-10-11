"use client";

import { useEffect, useState } from "react";

type Chip = { id: string; label: string };

/** Sticky anchor chips on /work; the active chip follows scroll (§9.5). */
export function ShowcaseChips({ chips }: { chips: Chip[] }) {
  const [active, setActive] = useState<string>("all");

  useEffect(() => {
    const bands = chips.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    bands.forEach((b) => io.observe(b));
    const onScroll = () => {
      if (bands[0] && bands[0].getBoundingClientRect().top > window.innerHeight * 0.45) setActive("all");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [chips]);

  const all = [{ id: "all", label: "ALL" }, ...chips];
  return (
    <nav className="chips" aria-label="Categories">
      <ul className="chips__list">
        {all.map((c) => {
          const on = c.id === active;
          return (
            <li key={c.id}>
              <a
                href={c.id === "all" ? "#main" : `#${c.id}`}
                className="osd-chip"
                data-tone={on ? "signal" : "paper"}
                aria-current={on ? "true" : undefined}
              >
                {c.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
