import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findCategory, getContent } from "@/content/store";
import { Button } from "@/components/ui/Button";
import { ExpandedView } from "@/components/work/ExpandedView";
import { Contact } from "@/components/contact/Contact";
import { Footer } from "@/components/chrome/Footer";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
};

// Tapes added from /admin after a build render on first request; unknown ids 404 below.
export const dynamicParams = true;

export async function generateStaticParams() {
  const { categories } = await getContent();
  return categories.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const c = findCategory((await getContent()).categories, category);
  return c ? { title: c.label.charAt(0) + c.label.slice(1).toLowerCase(), description: `${c.label} thumbnails — before and after.` } : {};
}

/** /work/[category] — one category in depth, with the Tracking Wipe (§9.6). */
export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { t } = await searchParams;
  const { categories } = await getContent();
  const c = findCategory(categories, category);
  if (!c) notFound();

  const i = categories.findIndex((x) => x.id === c.id);
  const prev = categories[(i - 1 + categories.length) % categories.length];
  const next = categories[(i + 1) % categories.length];
  const slug = Array.isArray(t) ? t[0] : t;
  const initial = Math.max(0, c.items.findIndex((it) => it.slug === slug)); // unknown slug → first item

  return (
    <>
      <main id="main" tabIndex={-1}>
        <section className="expanded scene" data-scene="night" data-channel="03" data-channel-label={c.label} aria-labelledby="category-title">
          <header className="wrap expanded__head">
            <Button variant="ghost" href="/work" icon="play" iconTurn={180} leading osd="ALL TAPES">
              ALL TAPES
            </Button>
            <h1 id="category-title" className="t-title">
              {c.label} <span aria-hidden="true">—</span>
            </h1>
            <div className="expanded__cats">
              <Button variant="icon" href={`/work/${prev.id}`} icon="chevron-left" aria-label={`Previous category: ${prev.label}`} osd={prev.label} />
              <Button variant="icon" href={`/work/${next.id}`} icon="chevron-right" aria-label={`Next category: ${next.label}`} osd={next.label} />
            </div>
          </header>
          {c.items.length > 0 ? (
            <ExpandedView key={c.id} items={c.items} initial={initial} />
          ) : (
            <p className="wrap t-osd-lg expanded__empty">NO TAPE — COMING SOON</p>
          )}
        </section>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
