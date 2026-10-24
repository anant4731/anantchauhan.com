"use client";

import { useEffect, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#01ABCDEFXYZ";

// Text that decodes itself from random glyphs, left to right.
export function ScrambleText({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let start = 0;
    const duration = 1100;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = (now - start - delay) / duration;
      if (t < 0) {
        setShown(text.replace(/\S/g, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]));
      } else {
        const done = Math.floor(Math.min(1, t) * text.length);
        setShown(
          text
            .split("")
            .map((ch, i) => (i < done || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(""),
        );
        if (t >= 1) return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
    </span>
  );
}
