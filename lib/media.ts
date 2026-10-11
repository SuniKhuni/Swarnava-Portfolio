// Server only. Where the editable content lives. Locally: ./content. In production set
// CONTENT_DIR to a persistent disk (the Docker image uses /data): data/content.json and the
// /admin uploads in media/ live there, so saves survive redeploys. The copy in the repo
// (content/data/content.json) is the seed: copied to CONTENT_DIR on first start.
import { join } from "node:path";

export const CONTENT_DIR = process.env.CONTENT_DIR || join(process.cwd(), "content");
export const SEED_FILE = join(process.cwd(), "content", "data", "content.json");
export const CONTENT_FILE = join(CONTENT_DIR, "data", "content.json");
export const MEDIA_DIR = join(CONTENT_DIR, "media");
/** Upload names: <kind>-<uuid>.webp — anything else is never served or deleted. */
export const MEDIA_NAME = /^(work|cover|client|bts)-[0-9a-f-]{36}\.webp$/;
