"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { BtsPhoto } from "@/content/types";

interface ArchiveItem {
  id: string;
  origIndex: number;
  src: string;
  alt: string;
  caption: string;
  filename: string;
  isUploaded: boolean;
}

const DEFAULT_CAPTIONS = [
  "THE BEGINNING",
  "BEHIND THE LENS",
  "STUDIO SESSIONS",
  "ANALOG ARCHIVE",
  "CREATIVE PROCESS",
  "NIGHT DRIFT",
  "RAW TAPES",
  "FINAL CUT",
];

function isRealImage(src?: string): boolean {
  if (!src) return false;
  if (src.includes("/placeholder/")) return false;
  if (src.startsWith("[")) return false;
  return true;
}

function CameraIcon({ className, size = 24 }: { className?: string; size?: number | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="6.5" width="19" height="13.5" rx="2.5" />
      <path d="M8 6.5V4.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <circle cx="12" cy="13.25" r="4" strokeWidth="2" />
      <circle cx="10.25" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PersonalArchive({
  photos,
  step,
}: {
  photos: BtsPhoto[];
  step?: number;
}) {
  // Normalize items from photos or default 8 placeholders
  const items: ArchiveItem[] = useMemo(() => {
    const rawList: BtsPhoto[] =
      photos.length > 0
        ? photos
        : Array.from({ length: 8 }, (_, i) => ({
            src: `/placeholder/bts/bts-${String(i + 1).padStart(2, "0")}-4x5.webp`,
            alt: `Personal Archive ${i + 1}`,
            caption: DEFAULT_CAPTIONS[i % DEFAULT_CAPTIONS.length],
          }));

    return rawList.map((p, idx) => {
      const isUploaded = isRealImage(p.src);
      const num = String(idx + 1).padStart(2, "0");
      const filename = isUploaded
        ? (p.src.split("/").pop() || `MEMORY_${num}.MOV`).toUpperCase()
        : `MEMORY_0${num}.MOV`;

      let caption = p.caption?.trim() || "";
      if (!caption || caption.startsWith("[") || caption.toUpperCase().includes("CAPTION")) {
        caption = DEFAULT_CAPTIONS[idx % DEFAULT_CAPTIONS.length];
      } else {
        caption = caption.toUpperCase();
      }

      return {
        id: `archive-${idx}`,
        origIndex: idx,
        src: p.src,
        alt: p.alt || `Archive photo ${num}`,
        caption,
        filename,
        isUploaded,
      };
    });
  }, [photos]);

  const n = items.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);

  // Timer & progress tracking
  const intervalMs = 5000;
  const tickStep = 50; // update progress every 50ms

  const goTo = useCallback(
    (index: number, dir: "next" | "prev" = "next") => {
      if (n === 0) return;
      const target = (index + n) % n;
      setSlideDir(dir);
      setCurrentIndex(target);
      setProgress(0);
      setAnimKey((k) => k + 1);
    },
    [n]
  );

  const handleNext = useCallback(() => {
    goTo(currentIndex + 1, "next");
  }, [currentIndex, goTo]);

  const handlePrev = useCallback(() => {
    goTo(currentIndex - 1, "prev");
  }, [currentIndex, goTo]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Sync with scroll step if user scrolls
  const lastStepRef = useRef<number | undefined>(step);
  useEffect(() => {
    if (step !== undefined && step !== lastStepRef.current) {
      lastStepRef.current = step;
      goTo(step, step > currentIndex ? "next" : "prev");
    }
  }, [step, currentIndex, goTo]);

  // Auto-advance every 5 seconds with smooth progress bar
  useEffect(() => {
    if (!isPlaying || n <= 1) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + (tickStep / intervalMs) * 100;
        if (nextProgress >= 100) {
          handleNext();
          return 0;
        }
        return nextProgress;
      });
    }, tickStep);

    return () => clearInterval(timer);
  }, [isPlaying, n, handleNext, intervalMs, tickStep]);

  // Current main item
  const mainItem = items[currentIndex] || items[0];

  // Circular sequence of upcoming thumbnails (up to 4)
  const upcomingThumbnails = useMemo(() => {
    if (n <= 1) return [];
    const count = Math.min(4, n - 1);
    const result: ArchiveItem[] = [];
    for (let k = 1; k <= count; k++) {
      const idx = (currentIndex + k) % n;
      result.push(items[idx]);
    }
    return result;
  }, [items, currentIndex, n]);

  // Simulated vintage tape timecode
  const timecodeString = useMemo(() => {
    const baseSeconds = 14 * 60 + 32; // 00:14:32 base
    const totalSec = baseSeconds + currentIndex * 28;
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    return `SP • 00:${mm}:${ss}`;
  }, [currentIndex]);

  // Drag / touch swipe handling for thumbnail track
  const dragStartX = useRef<number | null>(null);
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const diff = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(diff) > 28) {
      if (diff < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === " ") {
      e.preventDefault();
      togglePlay();
    }
  };

  return (
    <div
      className="archive"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Personal Archive 199X camcorder gallery"
    >
      {/* ── 1. Top Header ───────────────────────────────────── */}
      <div className="archive-header">
        <div className="archive-header__left">
          <span className="archive-corner-tl" aria-hidden="true" />
          <CameraIcon size={16} className="archive-header__cam" />
          <span className="archive-header__title">PERSONAL ARCHIVE / 199X</span>
        </div>
        <div className="archive-header__right">
          <span className="archive-rec-dot" aria-hidden="true" />
          <span className="archive-rec-text">REC</span>
        </div>
      </div>

      {/* ── 2. Main 16:9 Image Player ───────────────────────── */}
      <div className="archive-main">
        <div key={mainItem?.id || animKey} className="archive-main__viewport">
          {mainItem?.isUploaded ? (
            <div className="archive-main__media">
              <Image
                src={mainItem.src}
                alt={mainItem.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 85vw"
                priority
                className="archive-main__img"
              />
              <div className="archive-dashed-border" aria-hidden="true" />
            </div>
          ) : (
            <div className="archive-main__placeholder">
              <div className="archive-dashed-border" aria-hidden="true" />
              <div className="archive-main__placeholder-content">
                <CameraIcon size={48} className="archive-main__cam-icon" />
                <span className="archive-main__add">ADD IMAGE</span>
                <span className="archive-main__sub">16 : 9 • MAIN PHOTO</span>
              </div>
            </div>
          )}
        </div>

        {/* Vintage Camcorder OSD Bar */}
        <div className="archive-main__bar">
          <span className="archive-main__filename">{mainItem?.filename || "MEMORY_001.MOV"}</span>
          <span className="archive-main__timecode">{timecodeString}</span>
        </div>
      </div>

      {/* ── 3. Controls & Progress Row ──────────────────────── */}
      <div className="archive-controls">
        <div className="archive-controls__transport" role="group" aria-label="Media player controls">
          {/* Previous Button |◁ */}
          <button
            type="button"
            className="archive-btn"
            onClick={handlePrev}
            aria-label="Previous image"
            title="Previous (Left Arrow)"
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
              <path d="M6 5h2v14H6zm12 0L8.5 12 18 19z" />
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            type="button"
            className="archive-btn archive-btn--circle"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause auto-advance" : "Start auto-advance"}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width={10} height={10} fill="currentColor" aria-hidden="true">
                <path d="M7 6h3v12H7zm7 0h3v12h-3z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width={10}
                height={10}
                fill="currentColor"
                aria-hidden="true"
                style={{ transform: "translateX(1px)" }}
              >
                <path d="M9 6l9 6-9 6z" />
              </svg>
            )}
          </button>

          {/* Next Button ▷| */}
          <button
            type="button"
            className="archive-btn"
            onClick={handleNext}
            aria-label="Next image"
            title="Next (Right Arrow)"
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
              <path d="M6 5l9.5 7L6 19zm10 0h2v14h-2z" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="archive-progress" aria-hidden="true">
          <div className="archive-progress__fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Dynamic Counter & Caption */}
        <div className="archive-counter-caption">
          <span className="archive-counter">
            {String(currentIndex + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <span className="archive-sep">—</span>
          <span className="archive-caption">{mainItem?.caption}</span>
        </div>
      </div>

      {/* ── 4. Thumbnail Carousel Row ───────────────────────── */}
      <div className="archive-carousel" role="region" aria-label="Upcoming thumbnails carousel">
        <button
          type="button"
          className="archive-arrow-btn"
          onClick={handlePrev}
          aria-label="Previous thumbnails"
        >
          <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 6l-6 6 6 6" />
          </svg>
        </button>

        <div
          key={`thumbs-${animKey}`}
          className="archive-thumbs-track"
          data-slide-dir={slideDir}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {upcomingThumbnails.map((item) => (
            <button
              key={`${item.id}-${item.origIndex}`}
              type="button"
              className="archive-thumb-card"
              onClick={() => goTo(item.origIndex, "next")}
              aria-label={`Switch to image ${item.origIndex + 1}: ${item.caption}`}
            >
              <div className="archive-thumb-inner">
                <div className="archive-thumb-dashed-border" aria-hidden="true" />
                {item.isUploaded ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="160px"
                    className="archive-thumb__img"
                  />
                ) : (
                  <div className="archive-thumb-placeholder">
                    <CameraIcon size={24} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="archive-arrow-btn"
          onClick={handleNext}
          aria-label="Next thumbnails"
        >
          <svg
            viewBox="0 0 24 24"
            width={18}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* ── 5. Bottom Instructions ─────────────────────────── */}
      <div className="archive-footer">
        <span className="archive-footer__label">[ SCROLL / DRAG TO BROWSE MEMORIES ]</span>
      </div>
    </div>
  );
}
