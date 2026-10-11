// Server only. /admin sessions: one password (ADMIN_PASSWORD), an HMAC-signed, HttpOnly,
// SameSite=Strict cookie that expires after 8 hours. The signing key mixes ADMIN_SECRET with
// a hash of the password, so changing the password signs every session out.

import { cookies, headers } from "next/headers";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE = "tape_admin";
const MAX_AGE_S = 60 * 60 * 8;
const sha256 = (v: string) => createHash("sha256").update(v).digest();

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && (process.env.ADMIN_SECRET?.length ?? 0) >= 32);
}

function key() {
  return Buffer.concat([Buffer.from(process.env.ADMIN_SECRET ?? ""), sha256(process.env.ADMIN_PASSWORD ?? "")]);
}

const sign = (payload: string) => createHmac("sha256", key()).update(payload).digest("base64url");

function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Compares hashes, so the comparison takes the same time whatever the input's length. */
export function passwordMatches(input: string) {
  if (!adminConfigured()) return false;
  return timingSafeEqual(sha256(input), sha256(process.env.ADMIN_PASSWORD!));
}

export async function startSession() {
  const payload = `${Date.now() + MAX_AGE_S * 1000}.${randomBytes(12).toString("base64url")}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: MAX_AGE_S,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const i = value.lastIndexOf(".");
  if (i < 0) return false;
  const payload = value.slice(0, i);
  if (!safeEqual(Buffer.from(value.slice(i + 1)), Buffer.from(sign(payload)))) return false;
  return Number(payload.split(".")[0]) > Date.now();
}

/** Every admin action starts with this. */
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Not signed in");
}

/* ── Login throttle: 5 wrong passwords per address locks it for 15 minutes (per server instance). ── */
const LOCK = { tries: 5, ms: 15 * 60_000 };
const fails = new Map<string, { n: number; until: number }>();

export async function clientAddress() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export function lockedFor(ip: string) {
  const f = fails.get(ip);
  return f && f.n >= LOCK.tries && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 60_000) : 0;
}

export function recordFailure(ip: string) {
  const f = fails.get(ip);
  const n = (f && f.until > Date.now() ? f.n : 0) + 1;
  // `until` is the counting window, and once locked, the lock's end.
  fails.set(ip, { n, until: Date.now() + LOCK.ms });
}

export function clearFailures(ip: string) {
  fails.delete(ip);
}
