// Server only. Supabase over its REST APIs (no SDK): the content document in the
// `site_content` table (one row, id "main") and admin uploads in the public `media` bucket.
// On when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set; otherwise the site uses files
// (lib/media.ts) — local development, or a server with a disk.

const URL_ = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = "site_content";
const ROW = "main";
const BUCKET = "media";

/** The fetch cache tag every content read carries; saves invalidate it. */
export const CONTENT_TAG = "content";

export const supabaseOn = () => Boolean(URL_ && KEY);

const headers = (extra: Record<string, string> = {}) => ({ apikey: KEY!, Authorization: `Bearer ${KEY}`, ...extra });

async function check(res: Response, what: string) {
  if (!res.ok) throw new Error(`Supabase ${what} failed: ${res.status} ${await res.text().catch(() => "")}`.slice(0, 300));
  return res;
}

/** The stored document, or null if the row does not exist yet. `fresh` skips the cache (admin). */
export async function readContentRow(fresh = false): Promise<unknown | null> {
  const res = await fetch(`${URL_}/rest/v1/${TABLE}?id=eq.${ROW}&select=data`, {
    headers: headers(),
    ...(fresh ? { cache: "no-store" as const } : { cache: "force-cache" as const, next: { tags: [CONTENT_TAG] } }),
  });
  const rows = (await (await check(res, "read")).json()) as { data: unknown }[];
  return rows[0]?.data ?? null;
}

export async function writeContentRow(data: unknown) {
  const res = await fetch(`${URL_}/rest/v1/${TABLE}?on_conflict=id`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify({ id: ROW, data, updated_at: new Date().toISOString() }),
    cache: "no-store",
  });
  await check(res, "save");
}

export async function uploadMedia(name: string, body: Buffer) {
  const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${name}`, {
    method: "POST",
    headers: headers({ "Content-Type": "image/webp", "Cache-Control": "31536000", "x-upsert": "false" }),
    body: new Uint8Array(body),
    cache: "no-store",
  });
  await check(res, "upload");
}

/** Public URL of an upload (the bucket is public). */
export const mediaUrl = (name: string) => `${URL_}/storage/v1/object/public/${BUCKET}/${name}`;

export async function listMedia(): Promise<string[]> {
  const res = await fetch(`${URL_}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefix: "", limit: 1000, offset: 0 }),
    cache: "no-store",
  });
  return ((await (await check(res, "list")).json()) as { name: string }[]).map((f) => f.name);
}

export async function deleteMedia(names: string[]) {
  if (names.length === 0) return;
  const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: names }),
    cache: "no-store",
  });
  await check(res, "delete");
}
