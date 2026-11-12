import type { Client } from "@/content/types";
import { subscriberCounts } from "@/lib/youtube";
import { ClientReel } from "./ClientReel";

/**
 * "Worked with" — one self-contained section, built to be replaced.
 *
 * This file is the fixed part: it gets the clients (edited in /admin → Clients) and their live
 * YouTube subscriber counts, and gives the page its anchor (#clients) and night scene.
 * The design is ClientReel.tsx + client-reel.css. To put in a new design: write a component that
 * takes { clients, counts } and renders an <h2 id="worked-with">, then swap it in below. Nothing
 * else on the site depends on this folder's markup or styles.
 */
export async function WorkedWith({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return null;
  const counts = await subscriberCounts(clients.flatMap((c) => (c.channel ? [c.channel] : [])));
  return (
    <section id="clients" className="clients scene ambient" data-scene="night" data-channel="02" data-channel-label="CLIENTS" aria-labelledby="worked-with">
      <ClientReel clients={clients} counts={counts} />
    </section>
  );
}
