import { Hero } from "@/components/hero/Hero";
import { Bts } from "@/components/bts/Bts";
import { Clients } from "@/components/clients/Clients";
import { Projects } from "@/components/work/Projects";
import { Contact } from "@/components/contact/Contact";
import { Footer } from "@/components/chrome/Footer";
import { getContent, getSite } from "@/content/store";

export default async function Home() {
  const [site, { clients, categories }] = await Promise.all([getSite(), getContent()]);
  const niches = site.heroNiches.map((word) => {
    const category = categories.find((c) => c.niche === word);
    return { word, href: category ? `/work/${category.id}` : "/work" };
  });
  return (
    <>
      <main id="main" tabIndex={-1}>
        <Hero name={site.name} role={site.role} niches={niches} pillars={site.pillars} socials={site.socials} />
        <Bts about={site.about} photos={site.btsPhotos} />
        <Clients clients={clients} />
        <Projects categories={categories} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
