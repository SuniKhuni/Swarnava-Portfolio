// The site's content model. The data lives in content/data/content.json (edited from /admin);
// content/schema.ts validates it, content/store.ts reads it.

export const ASPECTS = ["16 / 9", "1 / 1", "4 / 5", "9 / 16"] as const;
export type Aspect = (typeof ASPECTS)[number];
export type CategoryId = string;

export const STRIPES = ["orange", "mustard", "blue", "pink"] as const;
export type Stripe = (typeof STRIPES)[number];

export interface ImageRef {
  src: string;
  width: number;
  height: number;
}

export interface WorkItem {
  slug: string;
  title: string; // ≤ 60 characters
  alt: string; // describes the finished piece
  client?: string;
  after: ImageRef; // the finished piece
  before?: ImageRef; // raw frame or first draft, same aspect
  aspect: Aspect;
  views?: string; // as supplied, e.g. "1.2M" — never computed, never invented
  href?: string; // link to the live video or post
  featured?: boolean; // shown full-width at the top of the home bento (needs a "before" for the slider)
}

export interface Category {
  id: CategoryId; // URL slug: /work/<id>
  label: string; // e.g. "GAMING"
  niche: string; // the word on the hero TV, e.g. "GAMING"
  stripe: Stripe;
  cover?: ImageRef;
  items: WorkItem[];
}

export interface Client {
  name: string;
  /** Static subscriber line, e.g. "4M+ SUBSCRIBERS" — shown until (or if) the live count is unavailable. */
  meta?: string;
  /** YouTube @handle (or a UC… channel ID): the live subscriber count comes from the YouTube Data API. */
  channel?: string;
  avatar?: ImageRef;
  href?: string;
  /** The role Swarnava played: "THUMBNAIL DESIGNER". */
  role?: string;
  /** What was delivered, in a line: "Thumbnails for 40+ long-form videos". */
  work?: string;
  /** The measured outcome, as supplied: "CTR 4.1% → 9.8%". Never invented. */
  result?: string;
}

export interface BtsPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export type SocialKind = "instagram" | "linkedin";

export interface SiteCopy {
  role: string; // ≤ 48 characters
  about: string[]; // 1–3 paragraphs, about 90 words in total
  pillars: string[];
  contactLine: string; // ≤ 80 characters
  email: string;
  socials: { label: string; href: string; kind?: SocialKind }[];
  /** The words the hero's top TV cycles through, CONTENT first. A word that matches a category's
   *  niche opens that category; any other opens /work. */
  heroNiches: string[];
  btsPhotos: BtsPhoto[];
}

/** Fixed: the name is the owner's artwork, not editable copy. */
export const IDENTITY = { name: "Swarnava Chakraborty", wordmark: "SWARNAVA" } as const;

export type Site = SiteCopy & typeof IDENTITY;

export interface Content {
  site: SiteCopy;
  clients: Client[];
  categories: Category[];
}

/** Numeric width / height for an aspect string. */
export const ratioOf = (a: Aspect) => {
  const [w, h] = a.split("/").map((n) => Number(n.trim()));
  return w / h;
};
