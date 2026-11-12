import type { Category } from "@/content/types";
import { Cassette } from "./Cassette";

/** The end of a tape: the other tapes, before the contact section. */
export function OtherTapes({ categories, current }: { categories: Category[]; current: string }) {
  const others = categories.filter((c) => c.id !== current && c.items.length > 0);
  if (others.length === 0) return null;
  return (
    <section className="other-tapes scene ambient" data-scene="night" aria-labelledby="other-tapes-title">
      <div className="wrap">
        <p className="t-osd-lg other-tapes__caption">END OF THIS TAPE</p>
        <h2 id="other-tapes-title" className="t-title other-tapes__title">
          CHECK OTHER TAPES
        </h2>
        <ul className="other-tapes__list">
          {others.map((c) => (
            <li key={c.id}>
              {/* numbered as on the shelf, not by its place in this list */}
              <Cassette category={{ id: c.id, label: c.label, stripe: c.stripe, cover: c.cover, count: c.items.length }} index={categories.indexOf(c)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
