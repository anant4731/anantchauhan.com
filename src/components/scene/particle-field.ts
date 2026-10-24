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
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
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

export type FieldOptions = {
  count: number;
  reducedMotion: boolean;
  fontFamily: string;
  // Returns the scroll position in formation units, 0 to 4.
  getProgress: () => number;
};

export class ParticleField {
  private renderer: WebGLRenderer;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private camera = new PerspectiveCamera(FOV, 1, 0.1, 200);
  private scene = new Scene();
  private geometry = new BufferGeometry();
  private material: ShaderMaterial;
  private layout: Layout = { w: 1, h: 1, mobile: false };

  private start = performance.now();
  private last = 0;
  private progress = 0;
  private pointer = new Vector2(0, 0);
  private pointerActive = 0;
  private mouse = new Vector3();
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
        uShift: { value: Array.from({ length: 5 }, () => new Vector3()) },
        uMouse: { value: new Vector3(0, 0, 0) },
        uShock: { value: new Vector3(0, 0, -100) },
        uColorA: { value: this.colorA },
        uColorB: { value: this.colorB },
      },
    });
    const points = new Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(points);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new Vector2(1, 1), 0.9, 0.5, 0.02);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.resize();
    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerdown", this.onPointerDown, { passive: true });
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
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.geometry.dispose();
    this.material.dispose();
    this.bloom.dispose();
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

  private onPointerMove = (e: PointerEvent) => {
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    this.pointerActive = e.pointerType === "mouse" ? 1 : 0;
  };

  private onPointerLeave = () => {
    this.pointerActive = 0;
  };

  private onPointerDown = (e: PointerEvent) => {
    if (this.opts.reducedMotion) return;
    if ((e.target as Element | null)?.closest("a, button, input, textarea, select, [data-no-shock]")) return;
    const ndc = new Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    const hit = this.toPlane(ndc);
    this.material.uniforms.uShock.value.set(hit.x, hit.y, (performance.now() - this.start) / 1000);
  };

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
    const time = (now - this.start) / 1000;
    const u = this.material.uniforms;
    u.uTime.value = time;

    if (!this.opts.reducedMotion) u.uIntro.value = Math.min(1, time / 2.6);

    const target = this.opts.getProgress();
    const ease = this.opts.reducedMotion ? 1 : 1 - Math.exp(-dt * 3.2);
    this.progress += (target - this.progress) * ease;
    u.uProgress.value = this.progress;

    const i = Math.min(3, Math.floor(this.progress));
    const f = this.progress - i;
    this.colorA.lerpColors(this.palette[i][0], this.palette[i + 1][0], f);
    this.colorB.lerpColors(this.palette[i][1], this.palette[i + 1][1], f);

    // On phones the copy sits on top of the formations, so dim them.
    u.uIntensity.value = this.layout.mobile ? 1 - 0.5 * Math.min(1, this.progress) : 1;

    const m = u.uMouse.value as Vector3;
    const hit = this.toPlane(this.pointer);
    m.x += (hit.x - m.x) * Math.min(1, dt * 8);
    m.y += (hit.y - m.y) * Math.min(1, dt * 8);
    m.z += ((this.opts.reducedMotion ? 0 : this.pointerActive) - m.z) * Math.min(1, dt * 4);

    // Gentle parallax: the camera drifts towards the cursor.
    const cx = this.opts.reducedMotion ? 0 : this.pointer.x * 1.6;
    const cy = this.opts.reducedMotion ? 0 : this.pointer.y * 1.0;
    this.camera.position.x += (cx - this.camera.position.x) * Math.min(1, dt * 2);
    this.camera.position.y += (cy - this.camera.position.y) * Math.min(1, dt * 2);
    this.camera.lookAt(0, 0, 0);

    this.composer.render(dt);
  };
}
