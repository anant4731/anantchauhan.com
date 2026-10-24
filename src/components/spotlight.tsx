"use client";

import type { ComponentProps, PointerEvent } from "react";

// A container whose glow follows the cursor (see .spotlight in globals.css).
export function Spotlight({ className = "", style, hue = 170, ...props }: ComponentProps<"div"> & { hue?: number }) {
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }
  return (
    <div
      {...props}
      onPointerMove={onPointerMove}
      style={{ ...style, ["--hue" as string]: hue }}
      className={`spotlight ${className}`}
    />
  );
}
