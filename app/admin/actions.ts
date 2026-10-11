"use server";

import { randomUUID } from "node:crypto";
import { mkdir, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath, updateTag } from "next/cache";
import sharp from "sharp";
import { contentSchema } from "@/content/schema";
import type { Content, ImageRef } from "@/content/types";
import { CONTENT_FILE, MEDIA_DIR, MEDIA_NAME } from "@/lib/media";
import { CONTENT_TAG, deleteMedia, listMedia, supabaseOn, uploadMedia, writeContentRow } from "@/lib/supabase";
import {
  clearFailures,
  clientAddress,
  endSession,
  lockedFor,
  passwordMatches,
  recordFailure,
  requireAdmin,
  startSession,
} from "@/lib/admin-auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await clientAddress();
  const locked = lockedFor(ip);
  if (locked) return { error: `Too many tries. Try again in ${locked} min.` };
  if (!passwordMatches(String(formData.get("password") ?? ""))) {
    recordFailure(ip);
    await new Promise((r) => setTimeout(r, 600)); // slows guessing
    return { error: "Wrong password." };
  }
  clearFailures(ip);
  await startSession();
  revalidatePath("/admin");
  return {};
}

export async function logout() {
  await endSession();
  revalidatePath("/admin");
}

export type SaveResult = { ok: true; savedAt: number; content: Content } | { ok: false; issues: { path: string; message: string }[] };

/** Validates the whole document, writes it atomically, removes uploads nothing uses, and rebuilds the pages. */
export async function saveContent(next: unknown): Promise<SaveResult> {
  await requireAdmin();
  const parsed = contentSchema.safeParse(next);
  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues.slice(0, 30).map((i) => ({ path: i.path.join("."), message: i.message })) };
  }
  const data: Content = parsed.data;
  const used = JSON.stringify(data);
  const unused = (files: string[]) => files.filter((f) => MEDIA_NAME.test(f) && !used.includes(`/media/${f}`));

  if (supabaseOn()) {
    try {
      await writeContentRow(data);
    } catch {
      return { ok: false, issues: [{ path: "", message: "The database did not accept the save. Try again in a moment." }] };
    }
    // Uploads no longer referenced anywhere are deleted (best effort).
    await listMedia()
      .then((files) => deleteMedia(unused(files)))
      .catch(() => {});
    updateTag(CONTENT_TAG);
  } else {
    const tmp = `${CONTENT_FILE}.${randomUUID()}.tmp`;
    await writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await rename(tmp, CONTENT_FILE);
    const files = await readdir(MEDIA_DIR).catch(() => [] as string[]);
    await Promise.all(unused(files).map((f) => unlink(join(MEDIA_DIR, f)).catch(() => {})));
  }

  revalidatePath("/", "layout");
  return { ok: true, savedAt: Date.now(), content: data };
}

const KINDS = ["work", "cover", "client", "bts"] as const;
const MAX_BYTES = 15 * 1024 * 1024;

export type UploadResult = { ok: true; image: ImageRef } | { ok: false; error: string };

/** Any image in; a WebP out (≤ 2560 px wide, metadata stripped — no camera or location data). */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No file." };
  if (file.size > MAX_BYTES) return { ok: false, error: "That file is over 15 MB." };
  if (!/^image\/(png|jpe?g|webp|avif|gif)$/.test(file.type)) return { ok: false, error: "Use a PNG, JPG, WebP, AVIF or GIF." };
  if (!(KINDS as readonly string[]).includes(kind)) return { ok: false, error: "Unknown upload." };
  try {
    const { data, info } = await sharp(Buffer.from(await file.arrayBuffer()), { animated: false })
      .rotate()
      .resize({ width: 2560, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    const name = `${kind}-${randomUUID()}.webp`;
    if (supabaseOn()) {
      await uploadMedia(name, data);
    } else {
      await mkdir(MEDIA_DIR, { recursive: true });
      await writeFile(join(MEDIA_DIR, name), data);
    }
    return { ok: true, image: { src: `/media/${name}`, width: info.width, height: info.height } };
  } catch (e) {
    const storage = e instanceof Error && e.message.startsWith("Supabase");
    return { ok: false, error: storage ? "The image could not be stored. Try again in a moment." : "That image could not be read." };
  }
}
