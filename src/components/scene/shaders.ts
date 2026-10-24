// 3D simplex noise by Ashima Arts / Stefan Gustavson (MIT licence).
const simplex = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uMotion;
uniform float uProgress;
uniform float uIntro;
uniform float uPixelRatio;
uniform float uSize;
uniform float uIntensity;
uniform vec3 uShift[5];
uniform float uWarp;
uniform vec3 uMouse;
uniform vec4 uShock;
uniform vec4 uWell;
uniform vec3 uColorA;
uniform vec3 uColorB;

attribute vec3 aP0;
attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aP4;
attribute vec3 aScatter;
attribute float aRand;
attribute float aSize;

varying vec3 vColor;
varying float vAlpha;

${simplex}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  float t = uTime * uMotion;

  vec3 p0 = aP0 + uShift[0];

  vec3 p1 = aP1;
  p1.xz = rot(t * 0.14) * p1.xz;
  p1.yz = rot(0.38) * p1.yz;
  p1 += uShift[1];

  vec3 p2 = aP2;
  p2.xz = rot(t * 0.09 + 0.6) * p2.xz;
  p2.yz = rot(1.05) * p2.yz;
  p2.xy = rot(-0.35) * p2.xy;
  p2 += uShift[2];

  vec3 p3 = aP3;
  p3.xz = rot(t * 0.21) * p3.xz;
  p3.xy = rot(t * 0.11) * p3.xy;
  p3 += uShift[3];

  vec3 p4 = aP4;
  p4.y += sin(p4.x * 0.32 + t * 0.9) * 0.9 + cos(p4.z * 0.28 + t * 0.65) * 0.9;
  p4 += uShift[4];

  // Each particle runs slightly ahead of or behind the scroll position, so
  // shapes dissolve and reform in a wave instead of all at once.
  float lp = clamp(uProgress + (aRand - 0.5) * 0.55, 0.0, 4.0);
  float seg = floor(lp);
  float f = lp - seg;
  float e = f * f * (3.0 - 2.0 * f);
  float le = seg + e;
  vec3 pos = p0 * max(0.0, 1.0 - abs(le))
           + p1 * max(0.0, 1.0 - abs(le - 1.0))
           + p2 * max(0.0, 1.0 - abs(le - 2.0))
           + p3 * max(0.0, 1.0 - abs(le - 3.0))
           + p4 * max(0.0, 1.0 - abs(le - 4.0));

  // Mid-transition the particles get swept up in turbulence.
  float storm = sin(3.14159 * e);
  vec3 q = pos * 0.12 + vec3(0.0, 0.0, t * 0.12);
  vec3 n = vec3(snoise(q), snoise(q + 17.3), snoise(q + 41.7));
  pos += n * (0.1 + storm * 3.2);
  // Hyperspace: mid-morph, particles rush at the camera and past it.
  pos.z += storm * (aRand - 0.2) * 16.0;

  float ip = clamp(uIntro * 1.45 - aRand * 0.45, 0.0, 1.0);
  ip = 1.0 - pow(1.0 - ip, 4.0);
  pos = mix(aScatter, pos, ip);

  // Scrolling fast streaks everything towards the camera: warp speed.
  pos.z += uWarp * (2.0 + aRand * 16.0);

  // Holding the mouse opens a black hole: particles spiral in, inner ones
  // faster, and pile up in an accretion disc around a dark event horizon.
  vec2 dw = pos.xy - uWell.xy;
  float wd = length(dw);
  float pull = uWell.z * smoothstep(15.0, 0.0, wd);
  vec2 dir = rot(pull * uWell.w / (0.6 + wd * 0.18)) * (dw / max(wd, 0.001));
  float disc = 1.8 + pow(aRand, 2.2) * 6.0;
  pos.xy = uWell.xy + dir * mix(wd, disc, pull);
  pos.z = mix(pos.z, (aRand - 0.5) * 0.8, pull);

  // The cursor pushes particles away and towards the camera.
  vec2 dm = pos.xy - uMouse.xy;
  float md = length(dm);
  float push = smoothstep(4.2, 0.0, md) * uMouse.z;
  pos.xy += (dm / max(md, 0.001)) * push * 2.4;
  pos.z += push * 3.0;

  // A click sends a shockwave ring out from the click point; releasing a
  // black hole sends a much bigger one (uShock.w is its power).
  float st = uTime - uShock.z;
  float wave = 0.0;
  if (st >= 0.0 && st < 4.0) {
    vec2 ds = pos.xy - uShock.xy;
    float sd = length(ds);
    wave = exp(-pow((sd - st * (16.0 + uShock.w * 6.0)) * 0.42, 2.0)) * exp(-st * 1.1) * uShock.w;
    pos.xy += (ds / max(sd, 0.001)) * wave * 3.0;
    pos.z += wave * 4.0;
  }

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min(uSize * aSize * uPixelRatio * (36.0 / -mv.z), 24.0 * uPixelRatio);

  float grad = clamp((pos.x + pos.y * 0.6) / 40.0 + 0.5 + (aRand - 0.5) * 0.35, 0.0, 1.0);
  vColor = mix(uColorA, uColorB, grad);
  vColor = mix(vColor, vec3(1.0), smoothstep(0.93, 1.0, aRand) * 0.8);
  // White-hot shock fronts, and an orange glow around the black hole.
  vColor = mix(vColor, vec3(1.0), clamp(wave, 0.0, 1.0) * 0.7);
  vColor = mix(vColor, vec3(1.0, 0.62, 0.32), pull * 0.65);

  float twinkle = 0.7 + 0.3 * sin(t * (0.8 + aRand * 2.5) + aRand * 60.0);
  vAlpha = twinkle * uIntensity * (0.55 + storm * 0.25) * (0.35 + 0.65 * ip);
  vAlpha *= 1.0 + pull * 0.6 + wave * 0.8;
  // Fade particles that fly right up to the lens instead of flashing the screen.
  vAlpha *= smoothstep(1.5, 9.0, -mv.z);
}
`;

export const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vColor, a * a * vAlpha);
}
`;
