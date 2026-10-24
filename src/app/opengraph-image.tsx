import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name}, ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deterministic star field so the image is identical on every build.
const stars = Array.from({ length: 90 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * 1200, y: r(2) * 630, s: 1 + r(3) * 3, o: 0.2 + r(4) * 0.7 };
});

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background:
            "radial-gradient(circle at 85% 10%, rgba(167,139,250,0.35), transparent 50%), radial-gradient(circle at 5% 90%, rgba(94,234,212,0.25), transparent 45%), #05060a",
          color: "#e8eaf0",
          position: "relative",
        }}
      >
        {stars.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.s,
              height: s.s,
              borderRadius: 9999,
              background: i % 3 ? "#5eead4" : "#a78bfa",
              opacity: s.o,
            }}
          />
        ))}
        <div style={{ fontSize: 26, letterSpacing: 8, color: "#5eead4", textTransform: "uppercase" }}>
          {site.role}
        </div>
        <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -4, marginTop: 18 }}>{site.name}</div>
        <div style={{ fontSize: 34, color: "rgba(232,234,240,0.75)", marginTop: 20, maxWidth: 900, lineHeight: 1.35 }}>
          {site.tagline}
        </div>
        <div style={{ fontSize: 26, color: "#8b90a0", marginTop: 48 }}>anantchauhan.com</div>
      </div>
    ),
    size,
  );
}
