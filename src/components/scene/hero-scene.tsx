"use client";

import { useEffect, useRef, useState } from "react";

// How far the page has scrolled through the [data-scene] sections, in
// formation units: 0 while the first section is centred, 1 for the second...
function sceneProgress() {
  const sections = document.querySelectorAll<HTMLElement>("[data-scene]");
  if (sections.length === 0) return 0;
  const mid = window.innerHeight / 2;
  const centers = Array.from(sections, (el) => {
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2;
  });
  if (mid <= centers[0]) return 0;
  for (let i = 0; i < centers.length - 1; i++) {
    if (mid < centers[i + 1]) return i + (mid - centers[i]) / (centers[i + 1] - centers[i]);
  }
  return Math.min(4, centers.length - 1);
}

function supportsWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const root = document.documentElement;
    if (!supportsWebGL()) {
      root.dataset.webgl = "off";
      return;
    }

    let cancelled = false;
    let field: { dispose: () => void } | undefined;
    (async () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const small = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
      const fontFamily = getComputedStyle(document.body).fontFamily;
      const [{ ParticleField }] = await Promise.all([
        import("./particle-field"),
        document.fonts.load(`800 100px ${fontFamily}`).catch(() => null),
      ]);
      if (cancelled) return;
      try {
        field = new ParticleField(canvas, {
          count: reducedMotion ? 18000 : small ? 26000 : 60000,
          reducedMotion,
          lite: small,
          fontFamily,
          getProgress: sceneProgress,
        });
        root.dataset.webgl = "on";
        setReady(true);
      } catch (err) {
        console.error("Particle scene failed to start", err);
        root.dataset.webgl = "off";
      }
    })();

    return () => {
      cancelled = true;
      field?.dispose();
      delete root.dataset.webgl;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 h-lvh w-full transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
