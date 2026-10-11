// Server only: reads YOUTUBE_API_KEY. Imported by the (server) clients section.

/** Subscriber counts by channel (@handle or UC… ID), fetched once a day on the server. */
export async function subscriberCounts(channels: string[]): Promise<Record<string, number>> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key || channels.length === 0) return {};
  const entries = await Promise.all(
    channels.map(async (channel) => {
      const by = channel.startsWith("UC") ? `id=${encodeURIComponent(channel)}` : `forHandle=${encodeURIComponent(channel)}`;
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&${by}&key=${key}`, {
          next: { revalidate: 86400 },
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { items?: { statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean } }[] };
        const stats = data.items?.[0]?.statistics;
        if (!stats || stats.hiddenSubscriberCount || !stats.subscriberCount) return null;
        return [channel, Number(stats.subscriberCount)] as const;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(entries.filter((e): e is readonly [string, number] => e !== null));
}

/** 4210000 → "4.2M", 950000 → "950K", rounded down like YouTube does. */
export function compactCount(n: number) {
  const fmt = (v: number, unit: string) => `${Math.floor(v * 10) / 10}`.replace(/\.0$/, "") + unit;
  if (n >= 1e9) return fmt(n / 1e9, "B");
  if (n >= 1e6) return fmt(n / 1e6, "M");
  if (n >= 1e3) return fmt(n / 1e3, "K");
  return String(n);
}
