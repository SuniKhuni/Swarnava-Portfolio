/* eslint-disable @next/next/no-img-element -- ImageResponse (Satori) renders plain <img>, not next/image */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { WORDMARK } from "@/lib/wordmark";

export const alt = "Swarnava Chakraborty sitting on a stack of retro TVs, the name SWARNAVA brushed in red behind him";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Rendered once at build time: the plate, the red brushed wordmark behind the subject, the cutout.
export default async function OpengraphImage() {
  const [scene, cutout, wordmark] = await Promise.all([
    readFile(join(process.cwd(), "public/hero/scene.png"), "base64"),
    readFile(join(process.cwd(), "public/hero/cutout.png"), "base64"),
    readFile(join(process.cwd(), "public/hero/wordmark.png"), "base64"),
  ]);
  // The plate (1672 × 941) fits the card's width, anchored to the bottom.
  const plateH = Math.round((1200 * 941) / 1672);
  // Letters 900 px wide, centred, their top 40 px from the card's top.
  const { x0, x1, y0 } = WORDMARK.letters;
  const wmW = Math.round(900 / (x1 - x0));
  const wmH = Math.round((wmW * WORDMARK.height) / WORDMARK.width);
  const wmLeft = Math.round(600 - (wmW * (x0 + x1)) / 2);
  const wmTop = Math.round(40 - wmH * y0);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#efd5bc" }}>
        <img src={`data:image/png;base64,${scene}`} width={1200} height={plateH} style={{ position: "absolute", left: 0, bottom: 0 }} alt="" />
        <img src={`data:image/png;base64,${wordmark}`} width={wmW} height={wmH} style={{ position: "absolute", left: wmLeft, top: wmTop }} alt="" />
        <img src={`data:image/png;base64,${cutout}`} width={1200} height={plateH} style={{ position: "absolute", left: 0, bottom: 0 }} alt="" />
      </div>
    ),
    { ...size },
  );
}
