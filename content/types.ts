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
  selected?: boolean; // shown in the home page's Selected Works (curated in /admin)
  featured?: boolean; // shown full-width with the before/after slider at the top of Selected Works (needs a "before")
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

/** The piece's real shape, from the uploaded image (falls back to the aspect label). */
export const itemRatio = (item: Pick<WorkItem, "after" | "aspect">) =>
  item.after?.width && item.after?.height ? item.after.width / item.after.height : ratioOf(item.aspect);

/** For CSS aspect-ratio: "1280 / 720". */
export const itemAspect = (item: Pick<WorkItem, "after" | "aspect">) =>
  item.after?.width && item.after?.height ? `${item.after.width} / ${item.after.height}` : item.aspect;

/** Running numbers off card titles: "Gaming 01" → "Gaming", "[GAMING 03 — TITLE]" → "[GAMING — TITLE]".
 *  Zero-padded numbers (01, 02…) anywhere, and any number straight after the tape's own name
 *  ("Gaming 1") — real numbers in a title ("GTA 5", "Top 10") stay. */
export const displayTitle = (title: string, label?: string) => {
  let t = title.replace(/\s+#?0\d{1,2}(?=\s|$|\]|—|–|-)/g, "").replace(/\s{2,}/g, " ").trim();
  if (label) {
    const name = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    t = t.replace(new RegExp(`^(${name})\\s*#?\\d{1,3}$`, "i"), "$1");
  }
  return t;
};

/** The card's credit line: "Client Name – Gaming", or just the tape's name. */
export const creditLine = (client: string | undefined, label: string) => {
  const tape = label.charAt(0) + label.slice(1).toLowerCase();
  return client ? `${client} – ${tape}` : tape;
};

/** What a card says. When the title is only the tape's name ("Gaming 01" → "Gaming"), the credit
 *  takes its place — "Client Name – Gaming" — instead of saying "Gaming" twice. */
export const cardText = (item: Pick<WorkItem, "title" | "client">, label: string) => {
  const title = displayTitle(item.title, label);
  const credit = creditLine(item.client, label);
  return title.toLowerCase() === label.toLowerCase() ? { title: credit, credit: null } : { title, credit };
};

/** Numeric width / height for an aspect string. */
export const ratioOf = (a: Aspect) => {
  const [w, h] = a.split("/").map((n) => Number(n.trim()));
  return w / h;
};
