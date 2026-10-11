import Image from "next/image";
import type { BtsPhoto } from "@/content/types";

/**
 * The top Polaroid as plain server HTML. Shown without JavaScript and while the
 * interactive stack (client-only, below the fold) loads — same box, so nothing shifts.
 */
export function PolaroidStatic({ photo }: { photo?: BtsPhoto }) {
  if (!photo) return null;
  return (
    <div className="polaroids">
      <div className="polaroids__deck">
        <div className="polaroid-slot" style={{ rotate: "-2.45deg" }} /* matches the interactive top card: restRotation(0) × 0.35 */>
          <figure className="polaroid">
            <div className="polaroid__photo">
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 26vw, 52vw" />
            </div>
            {photo.caption ? <figcaption className="polaroid__caption">{photo.caption}</figcaption> : null}
          </figure>
        </div>
      </div>
    </div>
  );
}
