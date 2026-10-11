import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { MEDIA_DIR, MEDIA_NAME } from "@/lib/media";
import { mediaUrl, supabaseOn } from "@/lib/supabase";

const HEADERS = { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" };

/** Serves /admin uploads — from the Supabase bucket or the local disk. Names are unique per
 *  upload, so they cache forever (on Vercel the CDN keeps them after the first request). */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const name = path.join("/");
  if (!MEDIA_NAME.test(name)) return new Response("Not found", { status: 404 });
  try {
    if (supabaseOn()) {
      const res = await fetch(mediaUrl(name), { cache: "no-store" });
      if (!res.ok || !res.body) return new Response("Not found", { status: 404 });
      return new Response(res.body, { headers: HEADERS });
    }
    return new Response(new Uint8Array(await readFile(join(MEDIA_DIR, name))), { headers: HEADERS });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
