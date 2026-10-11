import type { Metadata } from "next";
import { getContent, liveCategories, totalPieces } from "@/content/store";
import { Rise } from "@/components/fx/Rise";
import { CategoryBand } from "@/components/work/CategoryBand";
import { ShowcaseChips } from "@/components/work/ShowcaseChips";
import { MarqueeGroup, MarqueePauseButton } from "@/components/work/MarqueeRow";
import { Contact } from "@/components/contact/Contact";
import { Footer } from "@/components/chrome/Footer";

export const metadata: Metadata = {
  title: "All tapes",
  description: "Thumbnails and content visuals across gaming, podcast, crypto and social media.",
};

const pad = (n: number) => String(n).padStart(2, "0");

/** /work — everything, by category (§9.5). */
export default async function WorkPage() {
  const { categories } = await getContent();
  const live = liveCategories(categories);
  return (
    <>
      <main id="main" tabIndex={-1}>
        <MarqueeGroup>
          <section className="showcase scene" data-scene="night" data-channel="03" data-channel-label="WORK" aria-labelledby="all-tapes">
            <header className="wrap showcase__head">
              <h1 id="all-tapes" className="t-section">
                <Rise text="ALL TAPES" />
              </h1>
              <div className="showcase__count">
                <p className="t-osd-lg">
                  {pad(totalPieces(categories))} PIECES · {pad(live.length)} TAPES
                </p>
                <MarqueePauseButton what="the rows" />
              </div>
            </header>
            <ShowcaseChips chips={live.map((c) => ({ id: c.id, label: c.label }))} />
            {categories.map((c) => (
              <CategoryBand key={c.id} category={c} />
            ))}
            <div className="showcase__end" />
          </section>
        </MarqueeGroup>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
