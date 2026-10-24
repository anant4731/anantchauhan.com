import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FxShader } from "./fx-shader";
import { fragmentShader, vertexShader } from "./shaders";
import {
  galaxyShape,
  gridShape,
  knotShape,
  networkShape,
  scatterShape,
  shapeRadius,
  textShape,
  type Layout,
} from "./shapes";

// One colour pair per formation, in scroll order.
const PALETTE: [string, string][] = [
  ["#5eead4", "#a78bfa"],
  ["#38bdf8", "#818cf8"],
  ["#f0abfc", "#fbbf24"],
  ["#34d399", "#22d3ee"],
  ["#a78bfa", "#f472b6"],
];

const CAMERA_Z = 30;
const FOV = 45;
// A press shorter than this is a click (shockwave), longer is a black hole.
const HOLD_THRESHOLD = 0.22;

export type FieldOptions = {
  count: number;
  reducedMotion: boolean;
  // Phones and low-core devices skip the trail and grain passes.
  lite: boolean;
  fontFamily: string;
  // Returns the scroll position in formation units, 0 to 4.
  getProgress: () => number;
};

export class ParticleField {
  private renderer: WebGLRenderer;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private trails?: AfterimagePass;
  private fx: ShaderPass;
  private camera = new PerspectiveCamera(FOV, 1, 0.1, 200);
  private scene = new Scene();
  private geometry = new BufferGeometry();
  private material: ShaderMaterial;
  private layout: Layout = { w: 1, h: 1, mobile: false };

  private start = performance.now();
  private last = 0;
  private progress = 0;
  private lastSegment = 0;
  private warp = 0;
  private roll = 0;
  private glitch = 0;
  private nextGlitchAt = 4;
  private pointer = new Vector2(0, 0);
  private pointerActive = 0;
  private holding = false;
  private holdStart = 0;
  private wellStrength = 0;
  private wellSpin = 0;
  private resizeTimer = 0;
  private running = false;
  private colorA = new Color();
  private colorB = new Color();
  private palette = PALETTE.map(([a, b]) => [new Color(a), new Color(b)]);

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: FieldOptions,
  ) {
    this.renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    // Set the page colour as the scene background, not the clear colour: three
    // clears render targets with the raw sRGB value, and OutputPass would then
    // encode it a second time and turn the background grey.
    this.scene.background = new Color(0x05060a);
    this.camera.position.set(0, 0, CAMERA_Z);

    const n = opts.count;
    const rand = new Float32Array(n);
    const size = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      rand[i] = Math.random();
      size[i] = 0.6 + Math.pow(Math.random(), 4) * 2.6;
    }
    // `position` is unused by the shader but three needs it for the draw count.
    this.geometry.setAttribute("position", new BufferAttribute(new Float32Array(n * 3), 3));
    this.geometry.setAttribute("aScatter", new BufferAttribute(scatterShape(n), 3));
    this.geometry.setAttribute("aRand", new BufferAttribute(rand, 1));
    this.geometry.setAttribute("aSize", new BufferAttribute(size, 1));

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMotion: { value: opts.reducedMotion ? 0 : 1 },
        uProgress: { value: 0 },
        uIntro: { value: opts.reducedMotion ? 1 : 0 },
        uPixelRatio: { value: 1 },
        uSize: { value: 1 },
        uIntensity: { value: 1 },
        uWarp: { value: 0 },
        uShift: { value: Array.from({ length: 5 }, () => new Vector3()) },
        uMouse: { value: new Vector3(0, 0, 0) },
        uShock: { value: new Vector4(0, 0, -100, 1) },
        uWell: { value: new Vector4(0, 0, 0, 0) },
        uColorA: { value: this.colorA },
        uColorB: { value: this.colorB },
      },
    });
    const points = new Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(points);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    if (!opts.lite && !opts.reducedMotion) {
      this.trails = new AfterimagePass(0);
      this.composer.addPass(this.trails);
    }
    this.bloom = new UnrealBloomPass(new Vector2(1, 1), 0.9, 0.5, 0.02);
    this.composer.addPass(this.bloom);
    this.fx = new ShaderPass(FxShader);
    this.fx.uniforms.uGrain.value = opts.lite ? 0 : 0.035;
    this.composer.addPass(this.fx);
    this.composer.addPass(new OutputPass());

    this.resize();
    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    window.addEventListener("pointerup", this.onPointerUp, { passive: true });
    window.addEventListener("pointercancel", this.onPointerCancel, { passive: true });
    window.addEventListener("blur", this.onPointerCancel);
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.play();
  }

  dispose() {
    this.pause();
    window.clearTimeout(this.resizeTimer);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerCancel);
    window.removeEventListener("blur", this.onPointerCancel);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    document.removeEventListener("visibilitychange", this.onVisibility);
    document.documentElement.classList.remove("is-holding");
    this.geometry.dispose();
    this.material.dispose();
    this.trails?.dispose();
    this.bloom.dispose();
    this.fx.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }

  private play() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.renderer.setAnimationLoop(this.frame);
  }

  private pause() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  private onVisibility = () => (document.hidden ? this.pause() : this.play());

  private onResize = () => {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => this.resize(), 150);
  };

  private resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 1.75);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPixelRatio.value = dpr;
    this.fx.uniforms.uResolution.value.set(width * dpr, height * dpr);

    const h = 2 * CAMERA_Z * Math.tan((FOV * Math.PI) / 360);
    const w = h * this.camera.aspect;
    const mobile = width < 768 || w < h * 0.95;
    const prevMobile = this.layout.mobile;
    const changed = Math.abs(this.layout.w - w) > 0.5 || prevMobile !== mobile;
    this.layout = { w, h, mobile };
    this.material.uniforms.uSize.value = mobile ? 1.15 : 1;

    // Desktop puts formations to the right of the copy; mobile centres them.
    const side = mobile ? 0 : w * 0.22;
    const shift = this.material.uniforms.uShift.value as Vector3[];
    shift[0].set(0, mobile ? h * 0.12 : h * 0.09, 0);
    shift[1].set(side, 0, 0);
    shift[2].set(side, 0, 0);
    shift[3].set(side, 0, 0);
    shift[4].set(0, -h * 0.3 - shapeRadius(this.layout) * 0.2, 0);

    if (changed) this.buildShapes();
  }

  private buildShapes() {
    const n = this.opts.count;
    const l = this.layout;
    const shapes = [
      textShape(n, l, this.opts.fontFamily),
      networkShape(n, l),
      galaxyShape(n, l),
      knotShape(n, l),
      gridShape(n, l),
    ];
    shapes.forEach((data, i) => {
      const existing = this.geometry.getAttribute(`aP${i}`) as BufferAttribute | undefined;
      if (existing) {
        existing.copyArray(data);
        existing.needsUpdate = true;
      } else {
        this.geometry.setAttribute(`aP${i}`, new BufferAttribute(data, 3));
      }
    });
  }

  private seconds() {
    return (performance.now() - this.start) / 1000;
  }

  private toNdc(e: PointerEvent) {
    return new Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  }

  private onPointerMove = (e: PointerEvent) => {
    this.pointer.copy(this.toNdc(e));
    this.pointerActive = e.pointerType === "mouse" ? 1 : 0;
  };

  private onPointerLeave = () => {
    this.pointerActive = 0;
  };

  private onPointerDown = (e: PointerEvent) => {
    if (this.opts.reducedMotion || e.button !== 0) return;
    if ((e.target as Element | null)?.closest("a, button, input, textarea, select, [data-no-shock]")) return;
    this.pointer.copy(this.toNdc(e));
    if (e.pointerType !== "mouse") {
      // Holding on a touch screen means scrolling, so a tap is just a shockwave.
      this.shock(1);
      return;
    }
    this.holding = true;
    this.holdStart = this.seconds();
    document.documentElement.classList.add("is-holding");
  };

  private onPointerUp = () => {
    if (!this.holding) return;
    const held = this.seconds() - this.holdStart;
    this.release();
    this.shock(held < HOLD_THRESHOLD ? 1 : 1 + this.wellStrength * 2.6);
  };

  private onPointerCancel = () => {
    if (this.holding) this.release();
  };

  private release() {
    this.holding = false;
    document.documentElement.classList.remove("is-holding");
  }

  private shock(power: number) {
    const hit = this.toPlane(this.pointer);
    this.material.uniforms.uShock.value.set(hit.x, hit.y, this.seconds(), power);
    this.glitch = Math.max(this.glitch, Math.min(1, 0.35 * power));
  }

  // Where a screen point lands on the z = 0 plane the formations live on.
  private toPlane(ndc: Vector2) {
    const dir = new Vector3(ndc.x, ndc.y, 0.5).unproject(this.camera).sub(this.camera.position).normalize();
    const dist = -this.camera.position.z / dir.z;
    return this.camera.position.clone().add(dir.multiplyScalar(dist));
  }

  private frame = () => {
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const time = this.seconds();
    const calm = this.opts.reducedMotion;
    const u = this.material.uniforms;
    u.uTime.value = time;

    if (!calm) u.uIntro.value = Math.min(1, time / 2.6);

    // Scroll position, plus how fast it's changing (for warp speed).
    const target = this.opts.getProgress();
    const ease = calm ? 1 : 1 - Math.exp(-dt * 3.2);
    const prev = this.progress;
    this.progress += (target - this.progress) * ease;
    u.uProgress.value = this.progress;
    const velocity = dt > 0 ? (this.progress - prev) / dt : 0;
    const warpTarget = calm ? 0 : Math.min(1, Math.abs(velocity) * 0.8);
    this.warp += (warpTarget - this.warp) * Math.min(1, dt * (warpTarget > this.warp ? 6 : 2.5));
    u.uWarp.value = this.warp;

    const segment = Math.round(this.progress);
    if (segment !== this.lastSegment) {
      this.lastSegment = segment;
      if (!calm) this.glitch = Math.max(this.glitch, 0.55);
    }
    const f = this.progress - Math.floor(this.progress);
    const storm = Math.sin(Math.PI * f);

    const i = Math.min(3, Math.floor(this.progress));
    const fi = this.progress - i;
    this.colorA.lerpColors(this.palette[i][0], this.palette[i + 1][0], fi);
    this.colorB.lerpColors(this.palette[i][1], this.palette[i + 1][1], fi);

    // On phones the copy sits on top of the formations, so dim them.
    u.uIntensity.value = this.layout.mobile ? 1 - 0.5 * Math.min(1, this.progress) : 1;

    const m = u.uMouse.value as Vector3;
    const hit = this.toPlane(this.pointer);
    m.x += (hit.x - m.x) * Math.min(1, dt * 8);
    m.y += (hit.y - m.y) * Math.min(1, dt * 8);
    m.z += ((calm || this.holding ? 0 : this.pointerActive) - m.z) * Math.min(1, dt * 4);

    // The black hole grows while the button is held and collapses on release.
    const charging = this.holding && time - this.holdStart > HOLD_THRESHOLD;
    this.wellStrength = charging
      ? Math.min(1, this.wellStrength + dt * 0.9)
      : Math.max(0, this.wellStrength - dt * 3.5);
    this.wellSpin += dt * (1.5 + this.wellStrength * 5);
    const well = u.uWell.value as Vector4;
    well.x += (m.x - well.x) * Math.min(1, dt * 6);
    well.y += (m.y - well.y) * Math.min(1, dt * 6);
    // Ease in so the pull starts gently, then the spin winds the disc up.
    well.z = this.wellStrength * this.wellStrength * (3 - 2 * this.wellStrength);
    well.w = this.wellSpin;

    // Random glitch bursts while the name is on screen.
    if (!calm && this.progress < 0.3 && time > this.nextGlitchAt) {
      this.glitch = Math.max(this.glitch, 0.5 + Math.random() * 0.4);
      this.nextGlitchAt = time + 4 + Math.random() * 5;
    }
    this.glitch = Math.max(0, this.glitch - dt * 2.2);

    if (this.trails) {
      // Trails only show while things move fast; at rest the frame is clean.
      this.trails.damp = Math.min(0.88, this.warp * 0.4 + storm * 0.25 + well.z * 0.8);
    }
    const fxu = this.fx.uniforms;
    fxu.uTime.value = time;
    fxu.uGlitch.value = this.glitch;
    fxu.uAberration.value = 0.0018 + this.warp * 0.01 + well.z * 0.008 + storm * 0.004;

    // Camera: drift towards the cursor, widen the lens and roll at warp
    // speed, and lean into the black hole.
    const cx = calm ? 0 : this.pointer.x * 1.6;
    const cy = calm ? 0 : this.pointer.y * 1.0;
    this.camera.position.x += (cx - this.camera.position.x) * Math.min(1, dt * 2);
    this.camera.position.y += (cy - this.camera.position.y) * Math.min(1, dt * 2);
    this.camera.position.z = CAMERA_Z - well.z * 3;
    this.roll += (Math.sign(velocity) * this.warp * 0.12 - this.roll) * Math.min(1, dt * 3);
    this.camera.up.set(Math.sin(this.roll), Math.cos(this.roll), 0);
    const fov = FOV + this.warp * 16;
    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
    this.camera.lookAt(0, 0, 0);

    this.composer.render(dt);
  };
}
