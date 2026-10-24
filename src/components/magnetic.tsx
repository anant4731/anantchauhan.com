"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

// Pulls its child towards the cursor while hovered, then springs back.
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  function onPointerMove(e: PointerEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
  }

  function onPointerLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <span ref={ref} className="magnetic inline-block" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {children}
    </span>
  );
}
