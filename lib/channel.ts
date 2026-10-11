"use client";

import { useSyncExternalStore } from "react";

export type Scene = "cream" | "signal" | "night";
export type Channel = { number: string; label: string; scene: Scene };

const DEFAULT: Channel = { number: "01", label: "HOME", scene: "cream" };

let observed: Channel = DEFAULT;
let override: Channel | null = null;
let current: Channel = DEFAULT;
const listeners = new Set<() => void>();

function publish() {
  // The Dive's override only holds while the hero is still the observed section.
  const next = override && observed.number === "01" ? override : observed;
  if (next.number === current.number && next.label === current.label && next.scene === current.scene) return;
  current = next;
  listeners.forEach((l) => l());
}

/** Set by the section observer. */
export function setObservedChannel(c: Channel) {
  observed = c;
  publish();
}

/** Set by the Dive, which flips the HUD before the section boundary is reached. */
export function setChannelOverride(c: Channel | null) {
  override = c;
  publish();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const byPath = new Map<string, Channel>();

/** The channel a route starts on, before any section has been observed. Cached: snapshots must be stable. */
export function channelForPath(pathname: string): Channel {
  let c = byPath.get(pathname);
  if (!c) {
    const [, first, second] = pathname.split("/");
    c = first === "work" ? { number: "03", label: second ? second.replace(/-/g, " ").toUpperCase() : "WORK", scene: "night" } : DEFAULT;
    byPath.set(pathname, c);
  }
  return c;
}

let hydrated = false;

export function useChannel(pathname: string) {
  const fallback = channelForPath(pathname);
  return useSyncExternalStore(
    subscribe,
    () => (hydrated ? current : fallback),
    () => fallback,
  );
}

/** Called once the section observer has run on the client. */
export function markChannelHydrated() {
  if (hydrated) return;
  hydrated = true;
  listeners.forEach((l) => l());
}

/* The HUD's corners can sit over different scenes than the centre line: the top row
   takes the scene under the top edge, the bottom row the scene under the bottom edge. */
type Edges = { top: Scene; bottom: Scene };
let edges: Edges | null = null;
const edgeListeners = new Set<() => void>();

export function setEdgeScene(which: keyof Edges, scene: Scene) {
  const base = edges ?? { top: scene, bottom: scene };
  if (edges && base[which] === scene) return;
  edges = { ...base, [which]: scene };
  edgeListeners.forEach((l) => l());
}

function subscribeEdges(l: () => void) {
  edgeListeners.add(l);
  return () => edgeListeners.delete(l);
}

/** null until observed — the HUD then falls back to the channel's scene. */
export function useEdgeScenes() {
  return useSyncExternalStore(
    subscribeEdges,
    () => edges,
    () => null,
  );
}
