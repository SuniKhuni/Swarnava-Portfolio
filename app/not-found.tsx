import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "No signal" };

const BARS = ["cream", "mustard", "blue", "pink", "orange", "red", "gray"] as const;

/** NO SIGNAL — the 404 (§9.8). */
export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="no-signal scene" data-scene="night" data-channel="--" data-channel-label="NO SIGNAL">
      <div className="no-signal__bars" aria-hidden="true">
        {BARS.map((b) => (
          <span key={b} data-bar={b} />
        ))}
      </div>
      <div className="no-signal__static fx-static" aria-hidden="true" />
      <div className="wrap no-signal__body">
        <p className="osd-chip" data-tone="ink">
          CH -- NOT FOUND
        </p>
        <h1 className="t-section">
          <span className="fx-glitch-once">NO SIGNAL</span>
        </h1>
        <Button href="/" variant="solid" size="lg" icon="play" iconTurn={180} leading osd="HOME">
          BACK TO CH 01
        </Button>
      </div>
    </main>
  );
}
