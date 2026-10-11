// Server only. The site's content: in Supabase when it is configured (lib/supabase.ts),
// otherwise in CONTENT_DIR/data/content.json (lib/media.ts). Pages are static; an admin save
// writes it and revalidates them (app/admin/actions.ts).
// The repo's content/data/content.json is the seed: copied in on a first start.

import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { cache } from "react";
import { CONTENT_FILE, MEDIA_DIR, SEED_FILE } from "@/lib/media";
import { readContentRow, supabaseOn, writeContentRow } from "@/lib/supabase";
import { IDENTITY, type Category, type Content, type Site } from "./types";

async function readFileOrSeed() {
  try {
    return JSON.parse(await readFile(CONTENT_FILE, "utf8")) as Content;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT" || CONTENT_FILE === SEED_FILE) throw e;
    await mkdir(dirname(CONTENT_FILE), { recursive: true });
    await mkdir(MEDIA_DIR, { recursive: true });
    await copyFile(SEED_FILE, CONTENT_FILE).catch(() => {}); // two first requests at once: fine
    return JSON.parse(await readFile(CONTENT_FILE, "utf8")) as Content;
  }
}

async function readSupabaseOrSeed(fresh: boolean) {
  const stored = await readContentRow(fresh);
  if (stored) return stored as Content;
  // Never seed on a cached answer: an "empty" cached at build time must not overwrite saves.
  const confirmed = fresh ? null : await readContentRow(true);
  if (confirmed) return confirmed as Content;
  const seed = JSON.parse(await readFile(SEED_FILE, "utf8")) as Content;
  await writeContentRow(seed);
  return seed;
}

/** The whole content document, read once per request / render (cached between saves). */
export const getContent = cache(async (): Promise<Content> => (supabaseOn() ? readSupabaseOrSeed(false) : readFileOrSeed()));

/** The admin always edits the latest copy. */
export const getContentFresh = (): Promise<Content> => (supabaseOn() ? readSupabaseOrSeed(true) : readFileOrSeed());

export async function getSite(): Promise<Site> {
  return { ...(await getContent()).site, ...IDENTITY };
}

export const liveCategories = (categories: Category[]) => categories.filter((c) => c.items.length > 0);
export const totalPieces = (categories: Category[]) => categories.reduce((n, c) => n + c.items.length, 0);
export const findCategory = (categories: Category[], id: string) => categories.find((c) => c.id === id);
