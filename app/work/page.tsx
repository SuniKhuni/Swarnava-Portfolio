import type { Metadata } from "next";
import { getContent } from "@/content/store";
import { WorkShowcase } from "@/components/work/WorkShowcase";
import { Contact } from "@/components/contact/Contact";
import { Footer } from "@/components/chrome/Footer";

export const metadata: Metadata = {
  title: "All designs",
  description: "Thumbnails and content visuals across gaming, podcast, crypto, social media and more — before and after.",
};

/** /work — every design, with a tab per tape. */
export default async function WorkPage() {
  const { categories } = await getContent();
  return (
    <>
      <main id="main" tabIndex={-1}>
        <WorkShowcase categories={categories} initial="all" />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
