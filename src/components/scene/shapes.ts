// Particle formations for the home page. Each returns `count` xyz triples
// centred on the origin; the shader rotates, offsets and blends them.

export type Layout = { w: number; h: number; mobile: boolean };

const TAU = Math.PI * 2;
const rnd = Math.random;

function gauss() {
  // Box-Muller: a normally distributed sample, used for soft clusters.
  return Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(TAU * rnd());
}

function onSphere(): [number, number, number] {
  const x = gauss();
  const y = gauss();
  const z = gauss();
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}

// A share of every formation stays loose around it, so the scene never looks
// empty between shapes.
function dust(out: Float32Array, i: number, { w, h }: Layout) {
  out[i * 3] = (rnd() - 0.5) * w * 1.4;
  out[i * 3 + 1] = (rnd() - 0.5) * h * 1.4;
  out[i * 3 + 2] = (rnd() - 0.5) * 16;
}

export function shapeRadius({ w, h }: Layout) {
  return Math.min(w, h) * 0.3;
}

export function textShape(count: number, layout: Layout, fontFamily: string): Float32Array {
  const out = new Float32Array(count * 3);
  const lines = layout.mobile ? ["ANANT", "CHAUHAN"] : ["ANANT CHAUHAN"];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const fontPx = 220;
  const font = `800 ${fontPx}px ${fontFamily}`;
  ctx.font = font;
  const textW = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const lineH = fontPx * 1.02;
  canvas.width = Math.ceil(textW + 40);
  canvas.height = Math.ceil(lineH * lines.length + 40);
  // Resizing the canvas resets its state.
  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, 20 + lineH * (i + 0.5));
  });

  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const filled: number[] = [];
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (data[(y * width + x) * 4 + 3] > 128) filled.push(x, y);
    }
  }

  const worldW = layout.mobile ? layout.w * 0.88 : Math.min(layout.w * 0.8, 40);
  const scale = worldW / textW;
  const solid = Math.floor(count * 0.9);
  for (let i = 0; i < count; i++) {
    if (i >= solid || filled.length === 0) {
      dust(out, i, layout);
      continue;
    }
    const k = Math.floor(rnd() * (filled.length / 2)) * 2;
    out[i * 3] = (filled[k] + rnd() * 2 - width / 2) * scale;
    out[i * 3 + 1] = -(filled[k + 1] + rnd() * 2 - height / 2) * scale;
    out[i * 3 + 2] = (rnd() - 0.5) * 0.8;
  }
  return out;
}

// A globe of nodes joined by arcs: distributed systems.
export function networkShape(count: number, layout: Layout): Float32Array {
  const out = new Float32Array(count * 3);
  const R = shapeRadius(layout);
  const nodes = Array.from({ length: 42 }, (_, i) => {
    // Fibonacci sphere spreads the nodes evenly.
    const y = 1 - (i / 41) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * Math.PI * (3 - Math.sqrt(5));
    return [Math.cos(phi) * r, y, Math.sin(phi) * r];
  });
  for (let i = 0; i < count; i++) {
    const roll = rnd();
    let p: number[];
    if (roll < 0.45) {
      const s = onSphere();
      p = s.map((v) => v * R * (1 + (rnd() - 0.5) * 0.03));
    } else if (roll < 0.85) {
      const a = nodes[Math.floor(rnd() * nodes.length)];
      const b = nodes[Math.floor(rnd() * nodes.length)];
      const t = rnd();
      const m = a.map((v, j) => v * (1 - t) + b[j] * t);
      const len = Math.hypot(m[0], m[1], m[2]) || 1;
      const lift = R * (1 + 0.32 * Math.sin(Math.PI * t));
      p = m.map((v) => (v / len) * lift);
    } else if (roll < 0.95) {
      const n = nodes[Math.floor(rnd() * nodes.length)];
      p = n.map((v) => v * R + gauss() * R * 0.035);
    } else {
      dust(out, i, layout);
      continue;
    }
    out.set(p, i * 3);
  }
  return out;
}

// A spiral galaxy, flat in the xz plane; the shader tilts and spins it.
export function galaxyShape(count: number, layout: Layout): Float32Array {
  const out = new Float32Array(count * 3);
  const R = shapeRadius(layout) * 1.55;
  const arms = 4;
  for (let i = 0; i < count; i++) {
    const roll = rnd();
    if (roll < 0.05) {
      dust(out, i, layout);
      continue;
    }
    if (roll < 0.2) {
      out[i * 3] = gauss() * R * 0.09;
      out[i * 3 + 1] = gauss() * R * 0.05;
      out[i * 3 + 2] = gauss() * R * 0.09;
      continue;
    }
    const radius = Math.pow(rnd(), 1.4) * R;
    const angle = ((i % arms) / arms) * TAU + (radius / R) * 5.2;
    const spread = 0.08 + (radius / R) * 0.18;
    const jitter = () => Math.pow(rnd(), 2.6) * (rnd() < 0.5 ? 1 : -1) * R * spread;
    out[i * 3] = Math.cos(angle) * radius + jitter();
    out[i * 3 + 1] = jitter() * 0.35;
    out[i * 3 + 2] = Math.sin(angle) * radius + jitter();
  }
  return out;
}

// A (2,3) torus knot with a thick, glowing tube.
export function knotShape(count: number, layout: Layout): Float32Array {
  const out = new Float32Array(count * 3);
  const R = shapeRadius(layout) / 3.1;
  for (let i = 0; i < count; i++) {
    if (rnd() < 0.05) {
      dust(out, i, layout);
      continue;
    }
    const u = rnd() * TAU;
    const r = Math.cos(3 * u) + 2;
    const tube = Math.sqrt(rnd()) * 0.28;
    const [ox, oy, oz] = onSphere();
    out[i * 3] = (r * Math.cos(2 * u) + ox * tube) * R;
    out[i * 3 + 1] = (r * Math.sin(2 * u) + oy * tube) * R;
    out[i * 3 + 2] = (-Math.sin(3 * u) + oz * tube) * R * 1.4;
  }
  return out;
}

// A dotted grid floor running to the horizon; the shader makes it wave.
export function gridShape(count: number, layout: Layout): Float32Array {
  const out = new Float32Array(count * 3);
  const step = 1.6;
  for (let i = 0; i < count; i++) {
    let x = (rnd() - 0.5) * layout.w * 1.8;
    let z = (rnd() - 0.5) * 44 - 6;
    const roll = rnd();
    if (roll < 0.45) x = Math.round(x / step) * step;
    else if (roll < 0.9) z = Math.round(z / step) * step;
    out[i * 3] = x;
    out[i * 3 + 1] = (rnd() - 0.5) * 0.12;
    out[i * 3 + 2] = z;
  }
  return out;
}

// Where particles start before the intro pulls them into the name.
export function scatterShape(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [x, y, z] = onSphere();
    const r = 26 + rnd() * 50;
    out[i * 3] = x * r;
    out[i * 3 + 1] = y * r;
    out[i * 3 + 2] = z * r;
  }
  return out;
}
