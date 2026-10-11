import type { Category } from "@/content/types";
import { Rise } from "../fx/Rise";
import { OsdChip } from "../ui/OsdChip";
import { Button } from "../ui/Button";
import { MarqueeRow } from "./MarqueeRow";
import { ThumbCard } from "./ThumbCard";
import { HairlineGrow } from "./HairlineGrow";

const pad = (n: number) => String(n).padStart(2, "0");

/** One category on /work: a header row and two rows drifting opposite ways (§9.5). */
export function CategoryBand({ category }: { category: Category }) {
  const { items } = category;
  if (items.length === 0) return null;
  const rowA = items.filter((_, i) => i % 2 === 0);
  const rowB = items.filter((_, i) => i % 2 === 1);
  const single = items.length <= 4;
  const thumbs = (list: typeof items) =>
    list.map((item) => <ThumbCard key={item.slug} item={item} href={`/work/${category.id}?t=${item.slug}`} osd={category.label} />);

  return (
    <section id={category.id} className="band" aria-labelledby={`${category.id}-title`}>
      <div className="wrap band__head">
        <h2 id={`${category.id}-title`} className="t-title band__title">
          <Rise text={category.label} />
        </h2>
        <HairlineGrow />
        <div className="band__meta">
          <OsdChip tone="paper">{pad(items.length)} TAPES</OsdChip>
          <Button variant="ghost" href={`/work/${category.id}`} icon="arrow-up-right" osd={category.label}>
            OPEN
          </Button>
        </div>
      </div>
      <div className="band__rows">
        {single ? (
          <MarqueeRow label={`${category.label}, all pieces`} direction={-1} className="band__row">
            {thumbs(items)}
          </MarqueeRow>
        ) : (
          <>
            <MarqueeRow label={`${category.label}, row 1`} direction={-1} className="band__row">
              {thumbs(rowA)}
            </MarqueeRow>
            <MarqueeRow label={`${category.label}, row 2`} direction={1} className="band__row">
              {thumbs(rowB)}
            </MarqueeRow>
          </>
        )}
      </div>
    </section>
  );
}
