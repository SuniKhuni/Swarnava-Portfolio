import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findCategory, getContent } from "@/content/store";
import { WorkShowcase } from "@/components/work/WorkShowcase";
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

/** /work/[category] — one tape: its designs in the arrangement set in /admin, then the other tapes. */
export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { t } = await searchParams;
  const { categories } = await getContent();
  const c = findCategory(categories, category);
  if (!c) notFound();
  const slug = Array.isArray(t) ? t[0] : t;

  return (
    <>
      <main id="main" tabIndex={-1}>
        <WorkShowcase categories={categories} initial={c.id} focus={slug} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
