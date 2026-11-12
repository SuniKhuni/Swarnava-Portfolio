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
  /** A tiny blurred copy (data URL), shown while the image loads. Made on upload. */
  blur?: string;
}

/** How wide a piece sits in the work grid (desktop): 1, 2 or 3 per row. */
export const LAYOUTS = ["full", "half", "third"] as const;
export type Layout = (typeof LAYOUTS)[number];
export const LAYOUT_LABELS: Record<Layout, string> = {
  full: "Full width — 1 per row",
  half: "Featured — 2 per row",
  third: "Standard — 3 per row",
};
/** Pieces per row at each width. */
export const PER_ROW: Record<Layout, 1 | 2 | 3> = { full: 1, half: 2, third: 3 };

export interface WorkItem {
  slug: string;
  title: string; // ≤ 60 characters
  alt: string; // describes the finished piece
  client?: string;
  after: ImageRef; // the finished piece
  before?: ImageRef; // raw frame or first draft, same size — used only when `slider` is on
  aspect: Aspect;
  views?: string; // as supplied, e.g. "1.2M" — never computed, never invented
  href?: string; // link to the live video or post
  selected?: boolean; // shown in the home page's Selected Works (curated in /admin)
  slider?: boolean; // "Enable Before/After slider?" — off: a single static image, whatever else is uploaded
  layout?: Layout; // grid width; default: full for a slider, third otherwise
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

/** A before/after slider only when it is switched on and has a Before. */
export const hasSlider = (item: Pick<WorkItem, "slider" | "before">) => Boolean(item.slider && item.before);

/** The piece's grid width: as set, else full for a slider and third for a single image. */
export const layoutOf = (item: Pick<WorkItem, "slider" | "before" | "layout">): Layout => item.layout ?? (hasSlider(item) ? "full" : "third");

/** The piece's real shape, from the uploaded image (falls back to the aspect label). */
export const itemRatio = (item: Pick<WorkItem, "after" | "aspect">) =>
  item.after?.width && item.after?.height ? item.after.width / item.after.height : ratioOf(item.aspect);

/** For CSS aspect-ratio: "1280 / 720". */
export const itemAspect = (item: Pick<WorkItem, "after" | "aspect">) =>
  item.after?.width && item.after?.height ? `${item.after.width} / ${item.after.height}` : item.aspect;

/** Where a piece sits in the work grid: how many pieces share its row (k), its share of the row's
 *  width, the row's summed width : height (the row's height is its width over this), and whether
 *  the piece starts or ends the row. */
export type RowSlot = { k: number; share: number; sum: number; first: boolean; last: boolean };

// What it costs to show a piece that asked for `want` per row in a row of `k`: growing a little is
// cheap; a standard piece alone on a row (blown up to full width) is dear — dearer than pairing it
// with a full-width neighbour as two halves; squeezing a full-width piece three to a row, dearest.
const FIT_COST: Record<number, Record<number, number>> = {
  3: { 3: 0, 2: 1, 1: 5 },
  2: { 2: 0, 3: 1.5, 1: 2 },
  1: { 1: 0, 2: 3.5, 3: 9 },
};
/** A row taller than this share of its own width is capped to the screen and no longer fills the line. */
const TALL_ROW = 0.62;

/**
 * Lays pieces out in whole rows, in order. Every row holds 1, 2 or 3 pieces (2 at most on
 * tablets) that share one height, so their widths follow their shapes and each row fills the line
 * edge to edge — no holes, no orphan beside empty space, nothing cropped. Each piece asks for a
 * row size (its width in /admin); where the asks don't add up to whole rows (a lone "3 per row"
 * piece before a full-width one, say), the cheapest regrouping wins, and rows that already add up
 * are never touched.
 */
export function arrangeRows(items: Array<Pick<WorkItem, "slider" | "before" | "layout" | "after" | "aspect">>, maxPerRow: 2 | 3 = 3): RowSlot[] {
  const n = items.length;
  const ratio = items.map(itemRatio);
  // Tablets show one fewer per row: 3 → 2, 2 → 1.
  const want = items.map((it) => (maxPerRow === 3 ? PER_ROW[layoutOf(it)] : Math.max(1, PER_ROW[layoutOf(it)] - 1)));
  const best = new Array<number>(n + 1).fill(0);
  const take = new Array<number>(n).fill(1);
  for (let i = n - 1; i >= 0; i--) {
    best[i] = Infinity;
    // The row size this piece asked for is tried first, so a tie keeps the choice made in /admin.
    for (const k of [want[i], 1, 2, 3]) {
      if (k > maxPerRow || i + k > n) continue;
      let cost = best[i + k];
      let sum = 0;
      for (let j = i; j < i + k; j++) {
        cost += FIT_COST[want[j]][k];
        sum += ratio[j];
      }
      cost += 3 * Math.max(0, 1 / sum - TALL_ROW);
      if (cost < best[i] - 1e-9) {
        best[i] = cost;
        take[i] = k;
      }
    }
  }
  const slots: RowSlot[] = [];
  for (let i = 0; i < n; i += take[i]) {
    const k = take[i];
    const sum = ratio.slice(i, i + k).reduce((a, b) => a + b, 0);
    for (let j = i; j < i + k; j++) slots.push({ k, share: ratio[j] / sum, sum, first: j === i, last: j === i + k - 1 });
  }
  return slots;
}

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
