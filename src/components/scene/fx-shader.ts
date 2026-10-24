import { Vector2 } from "three";

// Final look pass: chromatic aberration, glitch tearing, vignette and grain.
// Runs in linear space, before OutputPass.
export const FxShader = {
  name: "FxShader",
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uAberration: { value: 0.002 },
    uGlitch: { value: 0 },
    uGrain: { value: 0.035 },
    uResolution: { value: new Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAberration;
    uniform float uGlitch;
    uniform float uGrain;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;

      // Glitch: tear random horizontal bands sideways, re-rolled 24 times a second.
      float tick = floor(uTime * 24.0);
      float band = floor(uv.y * mix(14.0, 42.0, hash(vec2(tick, 3.1))));
      float tear = step(hash(vec2(band, tick)), uGlitch * 0.4);
      uv.x += tear * (hash(vec2(band, tick + 7.0)) - 0.5) * 0.12 * uGlitch;

      vec2 dir = uv - 0.5;
      float d = length(dir);
      vec2 off = dir * (uAberration + tear * uGlitch * 0.02) * (0.35 + d * 1.8);
      vec3 col = vec3(
        texture2D(tDiffuse, uv + off).r,
        texture2D(tDiffuse, uv).g,
        texture2D(tDiffuse, uv - off).b
      );

      // A torn band also flashes a little brighter.
      col *= 1.0 + tear * uGlitch * 0.6;

      col *= 1.0 - smoothstep(0.42, 0.95, d) * 0.6;

      // Grain scaled by brightness, so the black background stays clean.
      float g = hash(uv * uResolution + fract(uTime * 7.31) * 113.0) - 0.5;
      col += g * uGrain * (0.02 + col);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};
