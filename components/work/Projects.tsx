import type { Category } from "@/content/types";
import { liveCategories } from "@/content/store";
import { Rise } from "../fx/Rise";
import { OsdChip } from "../ui/OsdChip";
import { Button } from "../ui/Button";
import { Shelf } from "./Shelf";
import { Bento } from "./Bento";

const pad = (n: number) => String(n).padStart(2, "0");

/** CH 03 — the four niches as VHS tapes on a shelf (§9.4). */
export function Projects({ categories }: { categories: Category[] }) {
  const tapes = categories.map((c) => ({ id: c.id, label: c.label, stripe: c.stripe, cover: c.cover, count: c.items.length }));
  return (
    <section id="work" className="projects scene" data-scene="night" data-channel="03" data-channel-label="WORK" aria-labelledby="projects-title">
      <div className="wrap">
        <div className="projects__head">
          <p className="t-osd-lg projects__caption">CH 03 — PICK A TAPE</p>
          <OsdChip tone="paper">{pad(liveCategories(categories).length)} TAPES</OsdChip>
        </div>
        <h2 id="projects-title" className="t-section projects__title">
          <Rise text="PROJECTS" />
        </h2>
      </div>
      <Shelf categories={tapes} />
      <Bento categories={categories} />
      <div className="wrap projects__foot">
        <Button variant="ghost" size="lg" href="/work" icon="arrow-up-right" osd="ALL TAPES">
          VIEW ALL TAPES
        </Button>
      </div>
    </section>
  );
}
