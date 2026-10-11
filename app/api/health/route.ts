import { revalidatePath } from "next/cache";
import { getContent } from "@/content/store";

// The host's health check. The pages are prerendered at build time from the repo's content,
// but the live content is on the persistent disk (and may be newer): the first check after the
// server starts refreshes every page, before any visitor is routed to it.
export const dynamic = "force-dynamic";

let fresh = false;

export async function GET() {
  try {
    await getContent(); // the content disk is readable (and seeded on a first start)
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
  if (!fresh) {
    revalidatePath("/", "layout");
    fresh = true;
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
