import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";
import { getContent } from "@/content/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { categories } = await getContent();
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...categories.map((c) => ({ url: `${siteUrl}/work/${c.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
