// Live pictures for the side TVs. Pure CSS / SVG: they loop on the compositor where they can,
// pause with the rest of the hero's loops, and hold still with reduced motion.

/** SMPTE-style colour bars, dimmed, with a tracking glitch now and then. */
export function ColourBars() {
  return (
    <span className="tv-bars" aria-hidden="true">
      <span className="tv-bars__main">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span key={n} data-bar={n} />
        ))}
      </span>
      <span className="tv-bars__strip">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span key={n} data-strip={n} />
        ))}
      </span>
    </span>
  );
}

/** A synthwave sunset: striped sun sinking slowly, palms, a shimmering sea. */
export function Sunset() {
  return (
    <span className="tv-sunset" aria-hidden="true">
      <span className="tv-sunset__sky" />
      <span className="tv-sunset__sun" />
      <span className="tv-sunset__sea" />
      <svg className="tv-sunset__palms" viewBox="0 0 100 80" preserveAspectRatio="xMidYMax slice">
        {/* left palm */}
        <path d="M22 80c1-12 2-22 5-33l1.6.4C26 58 25 68 24.6 80z" />
        <path d="M27.5 47c-6-6-14-6-19-2 5-1 10 0 14 3-6-1-11 2-14 7 4-3 9-4 15-3-3 3-5 7-5 12 2-5 5-9 9-11zm1 0c5-7 13-8 19-5-5 0-10 1-14 4 6-1 12 1 15 6-4-3-10-4-15-2 4 2 7 6 8 11-3-5-7-8-13-10z" />
        {/* right palm, smaller and further away */}
        <path d="M78 80c.6-9 1.4-16 3.4-24l1.2.3C81.3 64 80.6 71 80.3 80z" />
        <path d="M82 56.3c-4.5-4.4-10.5-4.4-14-1.5 3.8-.7 7.5 0 10.4 2.2-4.4-.7-8.2 1.5-10.4 5.2 3-2.2 6.7-3 11.1-2.2-2.2 2.2-3.7 5.2-3.7 8.9 1.5-3.7 3.7-6.7 6.7-8.2zm.8 0c3.7-5.2 9.6-5.9 14-3.7-3.7 0-7.4.7-10.4 3 4.5-.7 8.9.7 11.1 4.4-3-2.2-7.4-3-11.1-1.5 3 1.5 5.2 4.4 5.9 8.2-2.2-3.7-5.2-5.9-9.6-7.4z" />
      </svg>
    </span>
  );
}
