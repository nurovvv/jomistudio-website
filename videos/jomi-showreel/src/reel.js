// Jomi Studio hero showreel v2 — one Three.js canvas renders the Jomi mark bookends and the project shots;
// every frame is a pure function of HyperFrames time (hf-seek). Shot boundaries live in CUT. Shot 5 (Khoja
// Sokhtmon) is footage baked from its live 3D site, mounted in index.html over this canvas.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { JOMI_WORD_PATHS } from "./wordmark.js";

// ---------------------------------------------------------------- constants
const W = 1920;
const H = 1080;
const DUR = 15;
// Shot boundaries (s): break-open · KIMCHI · Odiliyon · Bilyard · Zarbulmasal · Khoja Sokhtmon · lockup
const CUT = [0, 1.2, 3.7, 6.1, 8.5, 10.9, 13.0, 15.0];
const COL = { cream: 0xf6f1e9, ink: 0x1f1d24, green: 0x4fc59a, red: 0xe5161e };
const HEX = { cream: "#F6F1E9", ink: "#1F1D24", green: "#4FC59A", muted: "#77737D" };
// The Jomi wordmark outlines (logo units) — see wordmark.js.
const WORD_PATHS = JOMI_WORD_PATHS;
// Mark size in world units for the dark shots (logo is 100 units square).
const M = 0.95;
const TILE = 0.44 * M;
// Centres of the four mark pieces relative to the mark centre, in logo units.
const MARK_POS = [
  [-28, 28],
  [28, 28],
  [-28, -28],
  [28, -28],
];

// ---------------------------------------------------------------- math
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = {
  inOutSine: (k) => -(Math.cos(Math.PI * k) - 1) / 2,
  outCubic: (k) => 1 - Math.pow(1 - k, 3),
  inCubic: (k) => k * k * k,
  inQuad: (k) => k * k,
  inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outQuint: (k) => 1 - Math.pow(1 - k, 5),
  outBack: (k, s = 1.7) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2),
};
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
// Backing-store density: 1 in preview, 2 when rendered with --resolution 4k (deviceScaleFactor).
const DPR = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
const tmpV = new THREE.Vector3();

// ---------------------------------------------------------------- renderer + post
const canvas = document.getElementById("reel-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(DPR);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const pmrem = new THREE.PMREMGenerator(renderer);
const ENV = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const composerTarget = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, composerTarget);
composer.setPixelRatio(DPR);
composer.setSize(W, H);
const placeholderCam = new THREE.PerspectiveCamera(30, W / H, 0.1, 60);
const renderPass = new RenderPass(new THREE.Scene(), placeholderCam);
const bokeh = new BokehPass(renderPass.scene, placeholderCam, { focus: 6, aperture: 0, maxblur: 0.01 });
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.4, 0.55, 0.85);
const output = new OutputPass();
// Film grain + soft vignette, seeded by frame index (deterministic).
const grain = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uSeed: { value: 0 }, uGrain: { value: 0.016 }, uVig: { value: 0.5 }, uRes: { value: new THREE.Vector2(W * DPR, H * DPR) } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uSeed; uniform float uGrain; uniform float uVig; uniform vec2 uRes; varying vec2 vUv;
    float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33 + uSeed); return fract((p3.x + p3.y) * p3.z); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = vUv - 0.5; d.x *= 1.3;
      float vig = 1.0 - uVig * dot(d, d);
      float n = hash(floor(vUv * uRes)) - 0.5;
      gl_FragColor = vec4(c.rgb * vig + n * uGrain, c.a);
    }`,
});
composer.addPass(renderPass);
composer.addPass(bokeh);
composer.addPass(bloom);
composer.addPass(output);
composer.addPass(grain);

// ---------------------------------------------------------------- 2D drawing helpers
function makeCanvas(w, h) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  return { cv, ctx: cv.getContext("2d") };
}
function texFrom(cv) {
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
// The Jomi mark: s = mark size in px (100 logo units).
function drawMark(ctx, x, y, s, ink, accent) {
  const u = s / 100;
  ctx.fillStyle = ink;
  rr(ctx, x, y, 44 * u, 44 * u, 0);
  ctx.fill();
  rr(ctx, x + 56 * u, y, 44 * u, 44 * u, 9 * u);
  ctx.fill();
  rr(ctx, x, y + 56 * u, 44 * u, 44 * u, 16 * u);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + 78 * u, y + 78 * u, 22 * u, 0, Math.PI * 2);
  ctx.fill();
}
// The wordmark, with the logo's own geometry; (x, y) is the logo's top-left, s the mark size in px.
function drawWord(ctx, x, y, s, color) {
  const u = s / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(u, u);
  ctx.fillStyle = color;
  WORD_PATHS.forEach((d) => ctx.fill(new Path2D(d)));
  ctx.restore();
}
function drawLogo(ctx, x, y, s, ink, accent) {
  drawMark(ctx, x, y, s, ink, accent);
  drawWord(ctx, x, y, s, ink);
}
function radialTexture(stops, size = 512) {
  const { cv, ctx } = makeCanvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return texFrom(cv);
}
function backdropTexture(inner, outer) {
  const { cv, ctx } = makeCanvas(1920, 1080);
  const g = ctx.createRadialGradient(960, 480, 60, 960, 540, 1150);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1920, 1080);
  return texFrom(cv);
}
function statusBar(ctx, w, color) {
  ctx.fillStyle = color;
  ctx.font = '600 30px "Inter Tight"';
  ctx.textBaseline = "middle";
  ctx.fillText("9:41", 56, 46);
  const bx = w - 118;
  [10, 15, 21, 27].forEach((bh, i) => ctx.fillRect(bx + i * 9, 58 - bh, 6, bh));
  ctx.globalAlpha = 0.45;
  rr(ctx, w - 72, 34, 46, 24, 7);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.globalAlpha = 1;
  rr(ctx, w - 68, 38, 32, 16, 4);
  ctx.fill();
}

// ---------------------------------------------------------------- 3D helpers
function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, 1.5 * Math.PI, false);
  return s;
}
// A bevelled tile 1 unit square, corner radius as a fraction of its size.
function tileGeom(rFrac) {
  const bev = 0.045;
  const inner = 1 - 2 * bev;
  const r = Math.max(0.02, rFrac - bev);
  const g = new THREE.ExtrudeGeometry(roundedRectShape(inner, inner, r), {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: bev,
    bevelSegments: 8,
    curveSegments: 32,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}
const GEO = {
  sq: tileGeom(0),
  r9: tileGeom(9 / 44),
  r16: tileGeom(16 / 44),
  ball: new THREE.SphereGeometry(0.5, 96, 64),
};
const PIECES = ["sq", "r9", "r16", "ball"];

function physical(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, ...opts });
}
function glowPlane(tex, size, opacity) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }),
  );
  return m;
}
function makeCamera(fov = 32, far = 60) {
  return new THREE.PerspectiveCamera(fov, W / H, 0.1, far);
}
function aim(cam, pos, target, roll = 0) {
  cam.position.copy(pos);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(target);
}
function shadowPlane(w, h, opacity) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShadowMaterial({ opacity }));
  m.receiveShadow = true;
  return m;
}
function softKey(color, intensity, pos, range = 4) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.copy(pos);
  l.castShadow = true;
  l.shadow.mapSize.set(2048, 2048);
  l.shadow.radius = 8;
  l.shadow.bias = -0.0004;
  Object.assign(l.shadow.camera, { left: -range, right: range, top: range, bottom: -range, near: 0.5, far: 30 });
  return l;
}
// A phone body with a canvas screen (phoneCanvas(), rounded corners drawn into it).
function makePhone(bodyMat, screenTex) {
  const g = new THREE.Group();
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(0.72, 1.53, 0.115), {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.018,
    bevelSegments: 6,
    curveSegments: 24,
  });
  bodyGeo.center();
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  g.add(body);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.69, 0.69 * (1290 / 600)),
    new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, toneMapped: false }),
  );
  screen.position.z = 0.0445;
  g.add(screen);
  const gloss = new THREE.Mesh(
    new THREE.PlaneGeometry(0.69, 0.69 * (1290 / 600)),
    new THREE.MeshPhysicalMaterial({ color: 0x000000, transparent: true, opacity: 0.1, roughness: 0.03, clearcoat: 1, depthWrite: false }),
  );
  gloss.position.z = 0.0455;
  g.add(gloss);
  return g;
}
// Phone screens are drawn in a 600x1290 logical space on a backing store PHONE_S times larger.
const PHONE_W = 600;
const PHONE_H = 1290;
const PHONE_S = 5 / 3;
function phoneCanvas() {
  return makeCanvas(Math.round(PHONE_W * PHONE_S), Math.round(PHONE_H * PHONE_S));
}
// Rounded-corner phone screen frame: clip, then draw content, then the camera island.
function phoneScreen(ctx, paint) {
  const w = PHONE_W;
  const h = PHONE_H;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(PHONE_S, 0, 0, PHONE_S, 0, 0);
  ctx.save();
  rr(ctx, 0, 0, w, h, 78);
  ctx.clip();
  paint(ctx, w, h);
  ctx.fillStyle = "#000";
  rr(ctx, w / 2 - 92, 22, 184, 50, 25);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- shared brand pieces (dark shots)
function brandSet(materials, scale) {
  return PIECES.map((p, i) => {
    const mesh = new THREE.Mesh(GEO[p], materials[i]);
    mesh.scale.setScalar(scale);
    mesh.castShadow = true;
    return mesh;
  });
}
function markWorld(i, cx = 0, cy = 0) {
  return v3(cx + (MARK_POS[i][0] * M) / 100, cy + (MARK_POS[i][1] * M) / 100, 0);
}

// Seamless-loop constants: the lockup's last frame equals the break-open's first frame.
const P0 = v3(0, 0.12, 6.2);
const LOOK0 = v3(0, 0, 0);
const glowBase = (t) => 0.2 + 0.04 * Math.sin((2 * Math.PI * t) / DUR);

// ================================================================ build
let ready = false;
let SHOTS = [];

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["jomi-reel"] = build();

window.addEventListener("hf-seek", (event) => {
  if (ready) renderAt(event.detail.time);
});

async function build() {
  const loader = new THREE.ImageLoader();
  const load = (src) => new Promise((resolve, reject) => loader.load(src, resolve, undefined, reject));
  const files = {
    deskImg: "kimchi/desktop.webp", deskTop: "kimchi/desktop-top.png", mobImg: "kimchi/mobile.webp",
    mobTop: "kimchi/mobile-top.png", mobBot: "kimchi/mobile-bottom.png",
    menu: "odiliyon/mobile.webp", menuTop: "odiliyon/mobile-top.png", menuPin: "odiliyon/mobile-pin.png",
    dish1: "odiliyon/dish-1.webp", dish2: "odiliyon/dish-2.webp", dish3: "odiliyon/dish-3.webp",
    qr: "odiliyon/qr.svg", mark: "odiliyon/mark.svg", wordmark: "odiliyon/wordmark.png", tagline: "odiliyon/tagline.png",
    board: "bilyard/board.webp", table2: "bilyard/table-2.webp", table3: "bilyard/table-3.webp", table4: "bilyard/table-4.webp",
    homeTj: "zarbulmasal/home-tj.webp", homeFa: "zarbulmasal/home-fa.webp", proverbTj: "zarbulmasal/proverb-tj.webp",
    proverbFa: "zarbulmasal/proverb-fa.webp", poetTj: "zarbulmasal/poet-tj.webp", ikat: "zarbulmasal/ikat.webp",
  };
  const img = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([k, f]) => [k, await load(`assets/${f}`)])));
  await Promise.all([400, 500, 600, 700].map((w) => document.fonts.load(`${w} 40px "Inter Tight"`)));

  const dark = buildDark();
  const kimchi = buildWebsites(img.deskImg, img.deskTop, img.mobImg, img.mobTop, img.mobBot);
  SHOTS = [
    (lt, t) => dark.shot1(lt * 2, t), // v1's 2.4 s break-open, played in 1.2 s
    (lt) => kimchi(lt * 1.12), // v1's 2.8 s KIMCHI shot, played in 2.5 s
    buildOdiliyon(img),
    buildBilyard(img),
    buildZarbulmasal(img),
    null, // Khoja Sokhtmon: footage in index.html covers the canvas
    dark.shot6,
  ];

  // Warm up shader programs so the first sampled frame of each shot is complete.
  SHOTS.forEach((shot, i) => {
    if (!shot) return;
    const mid = (CUT[i + 1] - CUT[i]) / 2;
    const s = shot(mid, CUT[i] + mid);
    renderer.compile(s.scene, s.camera);
  });
  ready = true;
  renderAt(window.__hfThreeTime || 0);
}

function renderAt(time) {
  const t = clamp(time, 0, DUR);
  let i = SHOTS.length - 1;
  for (let k = 0; k < SHOTS.length; k++) {
    if (t >= CUT[k] && t < CUT[k + 1]) {
      i = k;
      break;
    }
  }
  if (!SHOTS[i]) return; // footage shot: nothing to draw under it
  const s = SHOTS[i](t - CUT[i], t);
  renderPass.scene = s.scene;
  renderPass.camera = s.camera;
  bokeh.scene = s.scene;
  bokeh.camera = s.camera;
  bokeh.uniforms.focus.value = s.focus;
  bokeh.uniforms.aperture.value = s.aperture;
  bokeh.uniforms.maxblur.value = s.maxblur ?? 0.012;
  bokeh.uniforms.nearClip.value = s.camera.near;
  bokeh.uniforms.farClip.value = s.camera.far;
  bokeh.uniforms.aspect.value = W / H;
  bloom.strength = s.bloom ?? 0.35;
  bloom.threshold = s.threshold ?? 0.85;
  renderer.toneMappingExposure = s.exposure ?? 1;
  grain.uniforms.uSeed.value = Math.floor(t * 30) % 101;
  grain.uniforms.uGrain.value = s.grain ?? 0.016;
  grain.uniforms.uVig.value = s.vignette ?? 0.5;
  composer.render();
}

// ================================================================ Shots 1 + 6: dark stage
function buildDark() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x121116);
  scene.environment = ENV;
  scene.environmentIntensity = 0.3;
  scene.fog = new THREE.Fog(0x121116, 8, 20);
  const cam = makeCamera(32);

  // Satin dunes below the stage (static, seeded by formula).
  const duneGeo = new THREE.PlaneGeometry(32, 20, 260, 160);
  duneGeo.rotateX(-Math.PI / 2);
  const pos = duneGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = 0.3 * Math.sin(x * 0.55 + z * 0.25) + 0.17 * Math.sin(x * 1.25 - z * 0.7 + 1.3) + 0.07 * Math.sin(z * 1.9 + x * 0.35);
    pos.setY(i, y);
  }
  duneGeo.computeVertexNormals();
  const dunes = new THREE.Mesh(duneGeo, physical(0x131217, { roughness: 0.36, metalness: 0.3, envMapIntensity: 0.45 }));
  dunes.position.set(0, -1.8, -2);
  scene.add(dunes);

  const glow = glowPlane(radialTexture([[0, "rgba(79,197,154,0.95)"], [0.45, "rgba(79,197,154,0.28)"], [1, "rgba(79,197,154,0)"]]), 9, 0.2);
  glow.position.set(0, 0.3, -5);
  scene.add(glow);

  const key = new THREE.SpotLight(0xfff3e4, 2.2, 0, 0.5, 0.75, 0);
  key.position.set(1.6, 5.2, 4.2);
  scene.add(key, key.target);
  const rimWarm = new THREE.DirectionalLight(0xffe7cc, 1.8);
  rimWarm.position.set(-4, 2.4, -3.2);
  const rimGreen = new THREE.DirectionalLight(COL.green, 1.4);
  rimGreen.position.set(4.2, -0.8, -2.4);
  scene.add(rimWarm, rimGreen, new THREE.HemisphereLight(0x3a3842, 0x0b0a0d, 0.35));

  const cream = physical(COL.cream, { roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.06 });
  const green = physical(COL.green, { roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.03 });
  const pieces = brandSet([cream, cream, cream, green], TILE);
  pieces.forEach((p) => scene.add(p));

  // Wordmark plane (Shot 6): logo text region x 125..287.5, y 5..102.6 (logo units).
  const WX0 = 125;
  const WX1 = 287.5;
  const WY0 = 5;
  const WY1 = 102.6;
  const wpx = 12; // canvas px per logo unit
  const word = makeCanvas(Math.round((WX1 - WX0) * wpx), Math.round((WY1 - WY0) * wpx));
  const wordTex = texFrom(word.cv);
  const wordMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(((WX1 - WX0) * M) / 100, ((WY1 - WY0) * M) / 100),
    new THREE.MeshBasicMaterial({ map: wordTex, transparent: true, toneMapped: false, depthWrite: false, opacity: 0 }),
  );
  scene.add(wordMesh);
  let lastReveal = -1;
  function paintWord(reveal) {
    const key = Math.round(reveal * 400);
    if (key === lastReveal) return;
    lastReveal = key;
    const { cv, ctx } = word;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cv.width * reveal, cv.height);
    ctx.clip();
    drawWord(ctx, -WX0 * wpx, -WY0 * wpx, 100 * wpx, HEX.cream);
    ctx.restore();
    wordTex.needsUpdate = true;
  }
  // Lockup geometry: the whole logo (0..281.5) is centred; mark centre at 50, text centre at 206.25.
  const LOCK_MARK_X = ((50 - 140.75) * M) / 100;
  const WORD_DX = (((WX0 + WX1) / 2 - 50) * M) / 100;
  const WORD_DY = -(((WY0 + WY1) / 2 - 50) * M) / 100;

  const SCATTER = [
    { p: v3(-1.3, 0.66, -0.6), r: v3(0.6, -0.85, 0.28) },
    { p: v3(1.2, 0.8, 0.45), r: v3(-0.45, 0.75, -0.5) },
    { p: v3(-1.05, -0.74, 0.8), r: v3(0.85, 0.5, 0.22) },
    { p: v3(0.98, -0.58, 0.2), r: v3(0, 0, 0) },
  ];
  const FLY_FROM = [
    { p: v3(-3.8, 2.3, -5.5), r: v3(1.3, -2.1, 0.7) },
    { p: v3(4.0, 2.7, -3.8), r: v3(-1.0, 2.3, -0.9) },
    { p: v3(-3.2, -2.5, 3.0), r: v3(1.7, 1.1, 0.45) },
    { p: v3(2.8, -2.2, 3.7), r: v3(0, 0, 0) },
  ];

  function setPiece(i, p, r) {
    pieces[i].position.copy(p);
    pieces[i].rotation.set(r.x, r.y, r.z);
  }

  function shot1(lt, t) {
    const e = ease.inOutCubic(seg(lt, 0.25, 2.0));
    for (let i = 0; i < 4; i++) {
      const base = markWorld(i);
      const p = base.clone().lerp(SCATTER[i].p, e);
      p.y += 0.05 * Math.sin(lt * 2.1 + i * 1.7) * e;
      const r = SCATTER[i].r.clone().multiplyScalar(e);
      r.x += 0.22 * lt * e * (i % 2 ? 1 : -1);
      r.y += 0.3 * lt * e;
      if (i === 3) {
        // Velocity seam: the green sphere sweeps across the lens (right to left) into the cut.
        // The camera ends near z 4.7, so the path stays in front of it.
        const k = ease.inCubic(seg(lt, 1.75, 2.4));
        p.lerp(v3(-0.75, 0.3, 3.7), k);
      }
      setPiece(i, p, r);
    }
    wordMesh.material.opacity = 0;
    glow.material.opacity = glowBase(t);
    const c = ease.inOutSine(seg(lt, 0, 2.4));
    aim(cam, P0.clone().lerp(v3(-0.55, 0.32, 4.7), c), LOOK0, -0.06 * c);
    return { scene, camera: cam, focus: cam.position.distanceTo(LOOK0), aperture: 0.002 * ease.inOutSine(seg(lt, 0.2, 1.4)), maxblur: 0.012, bloom: 0.3, threshold: 0.95, exposure: 0.95 };
  }

  function shot6(lt, t) {
    // Fly-in to the lockup position (mark left of centre), staggered, sphere springs last (2.0 s shot).
    const slide = ease.inOutCubic(seg(lt, 1.62, 2.0));
    const markX = lerp(LOCK_MARK_X, 0, slide);
    for (let i = 0; i < 4; i++) {
      const d0 = i * 0.09;
      const k = seg(lt, d0, d0 + (i === 3 ? 0.85 : 0.75));
      const e = i === 3 ? ease.outBack(k, 1.4) : ease.outQuint(k);
      const target = markWorld(i, markX, 0);
      const p = FLY_FROM[i].p.clone().lerp(target, e);
      const r = FLY_FROM[i].r.clone().multiplyScalar(1 - Math.min(1, e));
      setPiece(i, p, r);
    }
    const reveal = ease.outCubic(seg(lt, 0.8, 1.2));
    paintWord(reveal);
    const fade = 1 - seg(lt, 1.6, 1.85);
    wordMesh.material.opacity = (reveal > 0 ? 1 : 0) * fade;
    wordMesh.position.set(markX + WORD_DX, WORD_DY, 0.02);
    const bloomBump = Math.sin(Math.PI * seg(lt, 0.75, 1.9));
    glow.material.opacity = glowBase(t) + 0.16 * bloomBump;
    const c = ease.outCubic(seg(lt, 0, 1.5));
    aim(cam, v3(0.45, -0.18, 7.6).lerp(P0, c), LOOK0, 0.04 * (1 - c));
    const ap = 0.0024 * (1 - ease.inOutSine(seg(lt, 0.3, 0.95)));
    return { scene, camera: cam, focus: cam.position.distanceTo(LOOK0), aperture: ap, maxblur: 0.014, bloom: 0.3 + 0.2 * bloomBump, threshold: 0.95, exposure: 0.95 };
  }

  return { shot1, shot6 };
}

// ================================================================ Shot 2: websites (KIMCHI, real captures)
function buildWebsites(deskImg, deskTop, mobImg, mobTop, mobBot) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0b0c);
  scene.environment = ENV;
  scene.environmentIntensity = 0.5;
  scene.fog = new THREE.Fog(0x0e0b0c, 9, 22);
  const cam = makeCamera(32);

  const redGlow = glowPlane(radialTexture([[0, "rgba(229,22,30,0.9)"], [0.5, "rgba(229,22,30,0.22)"], [1, "rgba(229,22,30,0)"]]), 13, 0.5);
  redGlow.position.set(-0.6, 0.6, -5.5);
  scene.add(redGlow);
  const haze = glowPlane(radialTexture([[0, "rgba(229,22,30,0.55)"], [1, "rgba(229,22,30,0)"]]), 9, 0.4);
  haze.rotation.x = -Math.PI / 2;
  haze.position.set(0, -1.75, -0.5);
  scene.add(haze);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), physical(0x0d0a0b, { roughness: 0.32, metalness: 0.3 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.8;
  scene.add(floor);

  const rimRed = new THREE.DirectionalLight(COL.red, 6);
  rimRed.position.set(-4.5, 2.6, -4.2);
  const key = new THREE.DirectionalLight(0xfff1e6, 1.5);
  key.position.set(2.6, 4.2, 5.2);
  const redPoint = new THREE.PointLight(COL.red, 8, 6, 1.6);
  redPoint.position.set(2.4, -0.2, -0.8);
  scene.add(rimRed, key, redPoint, new THREE.HemisphereLight(0x2b2a33, 0x140607, 0.5));

  // ---- laptop (MacBook-style, no logo)
  const alu = physical(0xc6c9ce, { metalness: 1, roughness: 0.3, envMapIntensity: 1.1 });
  const laptop = new THREE.Group();
  const base = new THREE.Mesh(new RoundedBoxGeometry(3.0, 0.07, 2.05, 4, 0.03), alu);
  laptop.add(base);
  const well = new THREE.Mesh(new THREE.PlaneGeometry(2.62, 1.0), physical(0x111114, { roughness: 0.6 }));
  well.rotation.x = -Math.PI / 2;
  well.position.set(0, 0.0352, -0.33);
  laptop.add(well);
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.163, 0.012, 0.148), physical(0x1a1a1d, { roughness: 0.5 }), 6 * 14);
  const km = new THREE.Matrix4();
  let ki = 0;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 14; c++) {
      km.makeTranslation(-1.19 + c * 0.183, 0.039, -0.76 + r * 0.164);
      keys.setMatrixAt(ki++, km);
    }
  }
  laptop.add(keys);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.7), physical(0xb5b8be, { metalness: 1, roughness: 0.22 }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.0355, 0.58);
  laptop.add(pad);
  const lid = new THREE.Group();
  lid.position.set(0, 0.035, -1.02);
  lid.rotation.x = -0.27;
  const shell = new THREE.Mesh(new RoundedBoxGeometry(3.0, 2.0, 0.045, 4, 0.02), alu);
  shell.position.set(0, 1.0, -0.023);
  lid.add(shell);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 1.95), physical(0x050506, { roughness: 0.15, clearcoat: 1 }));
  bezel.position.set(0, 1.0, 0.0006);
  lid.add(bezel);
  const desk = makeCanvas(2560, 1600);
  const deskTex = texFrom(desk.cv);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.84, 1.775), new THREE.MeshBasicMaterial({ map: deskTex, toneMapped: false }));
  screen.position.set(0, 1.035, 0.0012);
  lid.add(screen);
  const deskGloss = new THREE.Mesh(
    new THREE.PlaneGeometry(2.84, 1.775),
    new THREE.MeshPhysicalMaterial({ color: 0x000000, transparent: true, opacity: 0.12, roughness: 0.04, clearcoat: 1, depthWrite: false }),
  );
  deskGloss.position.set(0, 1.035, 0.002);
  lid.add(deskGloss);
  laptop.add(lid);
  laptop.scale.setScalar(0.85);
  laptop.position.set(0.05, -0.6, 0);
  laptop.rotation.y = 0.3;
  scene.add(laptop);

  function paintDesk(scrollCss) {
    const { ctx } = desk;
    const k = 1.25; // source px per css px
    ctx.drawImage(deskImg, 0, scrollCss * k, 1440 * k, 900 * k, 0, 0, 2560, 1600);
    ctx.drawImage(deskTop, 0, 0, deskTop.width, deskTop.height, 0, 0, 2560, (109 * 2560) / 1440);
    ctx.fillStyle = "#050506";
    rr(ctx, 1280 - 144, -28, 288, 80, 24);
    ctx.fill();
    deskTex.needsUpdate = true;
  }

  // ---- phone (real mobile capture)
  const mob = phoneCanvas();
  const mobTex = texFrom(mob.cv);
  const phone = makePhone(physical(0x2a2b30, { metalness: 0.85, roughness: 0.32, clearcoat: 0.6 }), mobTex);
  phone.position.set(0.72, -0.5, 1.05);
  phone.rotation.set(-0.06, -0.42, 0.07);
  scene.add(phone);
  function paintMob(scrollCss) {
    phoneScreen(mob.ctx, (ctx, w, h) => {
      ctx.fillStyle = "#0e0e0f";
      ctx.fillRect(0, 0, w, h);
      const k = 2.5; // source px per css px
      const top = 92;
      const viewCss = (h - top) / (600 / 390);
      ctx.drawImage(mobImg, 0, scrollCss * k, 390 * k, viewCss * k, 0, top, 600, h - top);
      ctx.drawImage(mobTop, 0, 0, mobTop.width, mobTop.height, 0, top, 600, (109 * 600) / 390);
      ctx.drawImage(mobBot, 0, 0, mobBot.width, mobBot.height, 0, h - (57 * 600) / 390, 600, (57 * 600) / 390);
      ctx.fillStyle = "#0e0e0f";
      ctx.fillRect(0, 0, w, top);
      statusBar(ctx, w, "#F4F4F5");
    });
    mobTex.needsUpdate = true;
  }

  // ---- defocused brand satellites
  const satTile = new THREE.Mesh(GEO.r9, physical(COL.cream, { roughness: 0.28, clearcoat: 1 }));
  satTile.scale.setScalar(0.55);
  const satBall = new THREE.Mesh(GEO.ball, physical(COL.green, { roughness: 0.18, clearcoat: 1 }));
  satBall.scale.setScalar(0.42);
  scene.add(satTile, satBall);

  const TARGET = v3(0.32, 0.05, 0.35);
  const screenWorld = new THREE.Vector3();
  return function shot2(lt) {
    const s = ease.inOutSine(seg(lt, 0, 2.8));
    paintDesk(lerp(60, 1380, s));
    paintMob(lerp(700, 2300, s));
    laptop.position.y = -0.6 + 0.03 * Math.sin(lt * 1.6);
    phone.position.y = -0.5 + 0.05 * Math.sin(lt * 1.9 + 1.0);
    phone.rotation.y = -0.42 + 0.08 * s;
    satTile.position.set(-2.3 + 0.5 * s, 1.15, -2.6);
    satTile.rotation.set(0.5 + lt * 0.4, -0.6 + lt * 0.5, 0.2);
    satBall.position.set(2.2 - 0.4 * s, 1.0 - 0.2 * s, -2.9);
    // Camera: slow arc left→right with a slight push, then an accelerating push into the screen.
    const arc = ease.inOutSine(seg(lt, 0, 2.45));
    const a = lerp(-0.4, -0.06, arc);
    let R = lerp(6.4, 5.8, arc);
    const push = ease.inCubic(seg(lt, 2.4, 2.8));
    R = lerp(R, 4.2, push);
    const y = lerp(1.05, 0.78, arc);
    aim(cam, v3(TARGET.x + R * Math.sin(a), y, TARGET.z + R * Math.cos(a)), TARGET);
    // Focus between the laptop screen and the phone so both read; blur grows only on the exit push.
    screen.getWorldPosition(screenWorld);
    const focus = (cam.position.distanceTo(screenWorld) + cam.position.distanceTo(phone.position)) / 2;
    return { scene, camera: cam, focus, aperture: 0.0007 + 0.0025 * push, maxblur: 0.012, bloom: 0.35, threshold: 0.93, exposure: 1.0 };
  };
}


// ---------------------------------------------------------------- v2 helpers
// Seeded PRNG (mulberry32): the same texture on every render.
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// An alpha-mask image (wordmark, tagline, QR code) drawn in one colour at w x h.
function tinted(img, color, w, h) {
  const { cv, ctx } = makeCanvas(Math.round(w), Math.round(h));
  ctx.drawImage(img, 0, 0, cv.width, cv.height);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, cv.width, cv.height);
  return cv;
}
// An image with rounded corners (transparent outside), radius in source px.
function rounded(img, r) {
  const { cv, ctx } = makeCanvas(img.width, img.height);
  rr(ctx, 0, 0, img.width, img.height, r);
  ctx.clip();
  ctx.drawImage(img, 0, 0);
  return cv;
}
// A flat card w world units wide that casts a cut-out shadow (alpha-tested).
function cardMesh(source, w) {
  const h = (w * source.height) / source.width;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: texFrom(source), alphaTest: 0.5, roughness: 0.55, side: THREE.DoubleSide }),
  );
  m.castShadow = true;
  return m;
}
// Android screen frame: like phoneScreen, with a punch-hole camera instead of the island.
function androidScreen(ctx, paint) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(PHONE_S, 0, 0, PHONE_S, 0, 0);
  ctx.save();
  rr(ctx, 0, 0, PHONE_W, PHONE_H, 70);
  ctx.clip();
  paint(ctx, PHONE_W, PHONE_H);
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(PHONE_W / 2, 46, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ================================================================ Shot 2: Odiliyon (QR menu, real captures)
function buildOdiliyon(img) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1f3a8a);
  scene.environment = ENV;
  scene.environmentIntensity = 0.5;
  const cam = makeCamera(30);

  // The café's wall: blue with vertical flutes, a warm lamp pool from above, darker toward the edges.
  const wall = makeCanvas(2048, 1152);
  {
    const { ctx } = wall;
    ctx.fillStyle = "#1F3A8A";
    ctx.fillRect(0, 0, 2048, 1152);
    for (let x = 0; x < 2048; x += 12) {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(x, 0, 2, 1152);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(x + 2, 0, 2, 1152);
    }
    const lamp = ctx.createRadialGradient(1024, -80, 40, 1024, -80, 1150);
    lamp.addColorStop(0, "rgba(230,204,150,0.42)");
    lamp.addColorStop(1, "rgba(230,204,150,0)");
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, 2048, 1152);
    const edge = ctx.createRadialGradient(1024, 560, 380, 1024, 560, 1350);
    edge.addColorStop(0, "rgba(6,12,40,0)");
    edge.addColorStop(1, "rgba(6,12,40,0.6)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, 2048, 1152);
  }
  const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 10.125), new THREE.MeshBasicMaterial({ map: texFrom(wall.cv), toneMapped: false }));
  wallMesh.position.set(0, 2.2, -3.5);
  scene.add(wallMesh);
  // Dark walnut table top
  const table = new THREE.Mesh(new THREE.PlaneGeometry(24, 12), physical(0x2a1e16, { roughness: 0.4, clearcoat: 0.35, clearcoatRoughness: 0.25 }));
  table.rotation.x = -Math.PI / 2;
  table.position.set(0, -1.05, 1.5);
  table.receiveShadow = true;
  scene.add(table);

  const key = softKey(0xfff0dc, 2.4, v3(-3, 5, 4), 4);
  const amber = new THREE.PointLight(0xe8a33a, 5, 7, 1.6);
  amber.position.set(2.6, 0.9, 1.2);
  scene.add(key, amber, new THREE.HemisphereLight(0xdde4ff, 0x2a1e16, 0.7));

  // ---- table stand: cream face in a brass frame, the arch mark, wordmark, tagline and the real QR code
  const F = { w: 1150, h: 1600 };
  const face = makeCanvas(F.w, F.h);
  const QR = { size: 600, y: 690 };
  {
    const { ctx } = face;
    ctx.fillStyle = "#F5F1E8";
    ctx.fillRect(0, 0, F.w, F.h);
    const gloss = ctx.createLinearGradient(0, 0, F.w * 0.6, F.h * 0.5);
    gloss.addColorStop(0, "rgba(255,255,255,0.55)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, F.w, F.h);
    ctx.strokeStyle = "#B49969";
    ctx.lineWidth = 14;
    rr(ctx, 24, 24, F.w - 48, F.h - 48, 46);
    ctx.stroke();
    ctx.strokeStyle = "rgba(180,153,105,0.55)";
    ctx.lineWidth = 4;
    rr(ctx, 48, 48, F.w - 96, F.h - 96, 30);
    ctx.stroke();
    ctx.drawImage(img.mark, F.w / 2 - 44, 110, 88, 110);
    const wmW = 780;
    const wmH = wmW / 3.4145;
    ctx.drawImage(tinted(img.wordmark, "#1F3A8A", wmW, wmH), (F.w - wmW) / 2, 250);
    const tgW = 470;
    const tgH = tgW / 8.3962;
    ctx.drawImage(tinted(img.tagline, "rgba(31,58,138,0.72)", tgW, tgH), (F.w - tgW) / 2, 250 + wmH + 18);
    const qx = (F.w - QR.size) / 2;
    ctx.drawImage(tinted(img.qr, "#16296A", QR.size, QR.size), qx, QR.y);
    ctx.strokeStyle = "#B49969";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    const o = 42;
    const L = 110;
    [
      [qx - o, QR.y - o, 1, 1],
      [qx + QR.size + o, QR.y - o, -1, 1],
      [qx - o, QR.y + QR.size + o, 1, -1],
      [qx + QR.size + o, QR.y + QR.size + o, -1, -1],
    ].forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * L);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * L, y);
      ctx.stroke();
    });
  }
  const S = { w: 1.15, h: 1.6, d: 0.045 };
  const creamSide = new THREE.MeshStandardMaterial({ color: 0xf1ebe0, roughness: 0.4 });
  const front = new THREE.MeshPhysicalMaterial({ map: texFrom(face.cv), roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(S.w, S.h, S.d), [creamSide, creamSide, creamSide, creamSide, front, creamSide]);
  panel.castShadow = true;
  panel.position.y = S.h / 2;
  const lean = new THREE.Group(); // leans the face back from its foot
  lean.position.y = 0.07;
  lean.rotation.x = -0.1;
  lean.add(panel);
  const base = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.09, 0.34, 3, 0.03), physical(0xb49969, { metalness: 1, roughness: 0.35 }));
  base.position.y = 0.045;
  base.castShadow = true;
  const stand = new THREE.Group();
  stand.add(lean, base);
  stand.position.set(-0.8, -1.05, -0.35);
  stand.rotation.y = 0.38;
  scene.add(stand);

  // Scan light: an amber band with a bright lower edge, swept down the QR code
  const beamCv = makeCanvas(64, 256);
  {
    const g = beamCv.ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "rgba(232,163,58,0)");
    g.addColorStop(0.8, "rgba(232,163,58,0.35)");
    g.addColorStop(0.97, "rgba(255,215,140,1)");
    g.addColorStop(1, "rgba(255,215,140,0)");
    beamCv.ctx.fillStyle = g;
    beamCv.ctx.fillRect(0, 0, 64, 256);
  }
  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(0.74, 0.16),
    new THREE.MeshBasicMaterial({ map: texFrom(beamCv.cv), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: 0 }),
  );
  beam.position.z = S.d / 2 + 0.004;
  panel.add(beam);
  const qrTop = (0.5 - QR.y / F.h) * S.h;
  const qrBottom = (0.5 - (QR.y + QR.size) / F.h) * S.h;

  // ---- phone with the real menu
  const mob = phoneCanvas();
  const mobTex = texFrom(mob.cv);
  const phone = makePhone(physical(0x1c1d22, { metalness: 0.85, roughness: 0.3, clearcoat: 0.6 }), mobTex);
  const PHONE_AT = v3(0.62, -0.12, 0.45);
  phone.position.copy(PHONE_AT);
  phone.rotation.set(-0.04, -0.34, 0.05);
  scene.add(phone);
  function paintMenu(scrollCss) {
    phoneScreen(mob.ctx, (ctx, w, h) => {
      ctx.fillStyle = "#F2ECE0";
      ctx.fillRect(0, 0, w, h);
      const k = 3; // source px per CSS px (390 CSS px -> 1170 px)
      const top = 92;
      const scale = 600 / 390;
      const viewCss = (h - top) / scale;
      ctx.drawImage(img.menu, 0, scrollCss * k, 390 * k, viewCss * k, 0, top, 600, h - top);
      // The site's pinned bars: header alone, header + category bar once the menu has scrolled past it
      const strip = scrollCss >= 628 ? img.menuPin : img.menuTop;
      ctx.drawImage(strip, 0, top, 600, (strip.height / k) * scale);
      ctx.fillStyle = "#1F3A8A";
      ctx.fillRect(0, 0, w, top);
      statusBar(ctx, w, "#FBF6EC");
    });
    mobTex.needsUpdate = true;
  }

  // ---- the three «Попробуйте» dish cards, flying out of the phone
  const dishes = [img.dish1, img.dish2, img.dish3].map((d) => cardMesh(rounded(d, 30), 0.56));
  dishes.forEach((m) => scene.add(m));
  const DISH_TO = [
    { p: v3(0.0, 0.42, 0.95), r: v3(0.05, -0.15, 0.17) },
    { p: v3(1.55, 0.2, 0.15), r: v3(0, -0.5, -0.14) },
    { p: v3(1.28, -0.72, 1.15), r: v3(-0.15, -0.3, 0.08) },
  ];
  const phoneFwd = v3(0, 0, 1).applyEuler(phone.rotation);
  const CLOSE = PHONE_AT.clone().add(phoneFwd.clone().multiplyScalar(2.3));
  const WIDE = v3(0.8, 0.42, 4.75);

  return function shot2(lt) {
    paintMenu(lerp(0, 1150, ease.inOutSine(seg(lt, 0.15, 2.4))));
    phone.position.y = PHONE_AT.y + 0.03 * Math.sin(lt * 1.8);
    const sk = seg(lt, 0.6, 1.3);
    beam.position.y = lerp(qrTop + 0.02, qrBottom - 0.02, ease.inOutSine(sk));
    beam.material.opacity = Math.sin(Math.PI * sk);
    dishes.forEach((m, i) => {
      const k = seg(lt, 1.0 + i * 0.1, 1.65 + i * 0.1);
      const e = ease.outBack(k, 1.3);
      const p = PHONE_AT.clone().add(v3(0, 0.1, 0.05)).lerp(DISH_TO[i].p, e);
      p.y += 0.03 * Math.sin(lt * 1.7 + i * 1.9) * k;
      m.position.copy(p);
      m.rotation.set(DISH_TO[i].r.x * e, lerp(-0.34, DISH_TO[i].r.y, e), DISH_TO[i].r.z * e);
      m.scale.setScalar(Math.max(0.001, lerp(0.2, 1, clamp(e, 0, 1.2))));
      m.visible = k > 0;
    });
    // Camera: tight on the phone's screen (the match from the KIMCHI push), pulls back to the stand,
    // drifts, then whips down into the cut.
    const pull = ease.outQuint(seg(lt, 0, 1.3));
    const drift = ease.inOutSine(seg(lt, 1.3, 2.4));
    const pos = CLOSE.clone().lerp(WIDE, pull).add(v3(-0.3 * drift, -0.05 * drift, -0.2 * drift));
    const look = PHONE_AT.clone().lerp(v3(0.1, -0.22, 0), pull);
    const whip = ease.inCubic(seg(lt, 2.05, 2.4));
    look.y -= 2.6 * whip;
    look.z += 0.8 * whip;
    aim(cam, pos, look);
    const focus = lerp(cam.position.distanceTo(PHONE_AT), cam.position.distanceTo(v3(-0.1, -0.2, 0.1)), pull);
    return { scene, camera: cam, focus, aperture: 0.0008 + 0.0028 * whip, maxblur: 0.012, bloom: 0.18, threshold: 0.95, exposure: 1.0, grain: 0.015, vignette: 0.42 };
  };
}

// ================================================================ Shot 3: Bilyard (cash-desk app, real captures)
function buildBilyard(img) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c2a1f);
  scene.environment = ENV;
  scene.environmentIntensity = 0.45;
  const cam = makeCamera(32);
  cam.near = 0.02; // the final dolly ends a few cm from the 8-ball
  cam.updateProjectionMatrix();

  // Felt: billiard green with seeded fibre noise, a lamp pool in the middle, darker toward the rails
  const felt = makeCanvas(2048, 2048);
  {
    const { ctx } = felt;
    const g = ctx.createRadialGradient(1024, 1024, 100, 1024, 1024, 1300);
    g.addColorStop(0, "#2A8A5C");
    g.addColorStop(0.45, "#1F7049");
    g.addColorStop(1, "#0F3D2E");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 2048, 2048);
    const rnd = mulberry32(7);
    for (let i = 0; i < 90000; i++) {
      ctx.fillStyle = rnd() < 0.5 ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.035)";
      ctx.fillRect(rnd() * 2048, rnd() * 2048, 2, 2);
    }
  }
  const feltMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ map: texFrom(felt.cv), roughness: 0.95 }));
  feltMesh.rotation.x = -Math.PI / 2;
  feltMesh.receiveShadow = true;
  scene.add(feltMesh);

  const lamp = new THREE.SpotLight(0xfff1dc, 3.2, 0, 0.62, 0.65, 0);
  lamp.position.set(0.5, 6.2, 1.0);
  lamp.target.position.set(0.4, 0, 0.5);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(2048, 2048);
  lamp.shadow.radius = 6;
  lamp.shadow.bias = -0.0003;
  scene.add(lamp, lamp.target, new THREE.HemisphereLight(0xcfe9dc, 0x0b2a1f, 0.6));

  // ---- tablet lying on the felt, the real tables board on its screen; three cards have lifted off it
  const SW = 2.36;
  const SH = SW / (2360 / 1640);
  const LIFT = [
    { src: img.table4, x: 0.0114, y: 0.5744, up: 0.36 },
    { src: img.table2, x: 0.3403, y: 0.1439, up: 0.52 },
    { src: img.table3, x: 0.6691, y: 0.1439, up: 0.7 },
  ];
  const CW = 0.3195;
  const CH = 0.4177;
  const scr = makeCanvas(2360, 1640);
  scr.ctx.drawImage(img.board, 0, 0);
  LIFT.forEach((c) => {
    scr.ctx.fillStyle = "#E8E7E3";
    rr(scr.ctx, c.x * 2360, c.y * 1640, CW * 2360, CH * 1640, 42);
    scr.ctx.fill();
  });
  const tablet = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(SW + 0.18, 0.07, SH + 0.18, 4, 0.05), physical(0x111113, { roughness: 0.3, metalness: 0.5, clearcoat: 0.6 }));
  body.position.y = 0.035;
  body.castShadow = true;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: texFrom(scr.cv), toneMapped: false }));
  screen.rotation.x = -Math.PI / 2;
  screen.position.y = 0.0705;
  const catcher = shadowPlane(SW, SH, 0.38); // the lifted cards' shadows on the screen
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = 0.0712;
  tablet.add(body, screen, catcher);
  tablet.rotation.y = -0.12;
  scene.add(tablet);
  const cards = LIFT.map((c) => {
    const m = cardMesh(c.src, CW * SW);
    m.rotation.x = -Math.PI / 2;
    tablet.add(m);
    return { ...c, m, cx: (c.x + CW / 2 - 0.5) * SW, cz: (c.y + CH / 2 - 0.5) * SH };
  });

  // ---- billiard balls: the cue ball runs into the 8-ball, which rolls toward the lens
  const R = 0.11;
  const eightCv = makeCanvas(1024, 512);
  {
    const { ctx } = eightCv;
    ctx.fillStyle = "#0b0b0d";
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = "#F6F4EE";
    ctx.beginPath();
    ctx.arc(256, 256, 78, 0, Math.PI * 2); // u = 0.25 faces +z
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.font = '700 96px "Inter Tight"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("8", 256, 262);
  }
  const ballGeo = new THREE.SphereGeometry(R, 64, 48);
  const cue = new THREE.Mesh(ballGeo, physical(0xf4f1ea, { roughness: 0.12, clearcoat: 1 }));
  const eight = new THREE.Mesh(ballGeo, new THREE.MeshPhysicalMaterial({ map: texFrom(eightCv.cv), roughness: 0.12, clearcoat: 1 }));
  cue.castShadow = true;
  eight.castShadow = true;
  scene.add(cue, eight);
  const BX = 1.75;
  const EIGHT_Z = 1.35;
  const CUE_FROM = -0.35;
  const HIT = 1.45;

  return function shot3(lt) {
    cards.forEach((c, i) => {
      const k = seg(lt, 0.35 + i * 0.12, 1.15 + i * 0.12);
      const e = ease.outBack(k, 1.4);
      c.m.position.set(c.cx, 0.074 + c.up * e + 0.02 * Math.sin(lt * 1.6 + i * 2) * k, c.cz);
      c.m.rotation.set(-Math.PI / 2 + 0.08 * e * (i % 2 ? 1 : -1), 0, 0.05 * e * (i - 1));
    });
    // Cue ball rolls in (+z) and stops dead on the 8-ball; the 8-ball carries on, slowing
    const ck = seg(lt, 0.7, HIT);
    const cz = lerp(CUE_FROM, EIGHT_Z - 2 * R, ease.inQuad(ck));
    cue.position.set(BX, R, cz);
    cue.rotation.set((cz - CUE_FROM) / R, 0, 0);
    const ek = seg(lt, HIT, 2.4);
    const ez = lerp(EIGHT_Z, 2.5, ease.outCubic(ek));
    eight.position.set(BX, R, ez);
    eight.rotation.set((ez - EIGHT_Z) / R, 0, 0);
    // Camera: from overhead (the tilt carried over from Odiliyon) down to a three-quarter view, then a dolly
    // to the 8-ball until its black fills the frame
    const a = ease.inOutSine(seg(lt, 0, 1.25));
    const pos = v3(0.15, 6.2, 1.1).lerp(v3(2.9, 2.0, 3.6), a);
    const look = v3(0, 0, 0.2).lerp(v3(0.55, 0.1, 0.45), a);
    const toBall = ease.inOutSine(seg(lt, 1.2, 1.75));
    look.lerp(eight.position, toBall);
    // The dolly lands two frames before the cut, with the camera close enough that the ball fills the frame
    const dolly = ease.inCubic(seg(lt, 1.6, 2.32));
    pos.lerp(v3(BX, R + 0.02, ez + 0.17), dolly);
    aim(cam, pos, look);
    const focus = lerp(cam.position.distanceTo(v3(0.4, 0.3, 0.3)), cam.position.distanceTo(eight.position), toBall);
    return { scene, camera: cam, focus, aperture: 0.0012 + 0.002 * dolly, maxblur: 0.012, bloom: 0.15, threshold: 0.95, exposure: 1.0, grain: 0.016, vignette: 0.5 };
  };
}

// ================================================================ Shot 4: Zarbulmasal (Android app, store screens)
function buildZarbulmasal(img) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1327);
  scene.environment = ENV;
  scene.environmentIntensity = 0.5;
  const cam = makeCamera(30);

  // Navy ground with the app icon's ikat diamond at 17 %, a soft lift in the middle
  const bg = makeCanvas(2048, 1152);
  {
    const { ctx } = bg;
    ctx.fillStyle = "#0B1327";
    ctx.fillRect(0, 0, 2048, 1152);
    const lift = ctx.createRadialGradient(1024, 600, 60, 1024, 600, 1000);
    lift.addColorStop(0, "rgba(255,255,255,0.07)");
    lift.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = lift;
    ctx.fillRect(0, 0, 2048, 1152);
    ctx.globalAlpha = 0.17;
    const dh = 1060;
    const dw = dh * (img.ikat.width / img.ikat.height);
    ctx.drawImage(img.ikat, 1024 - dw / 2, 600 - dh / 2, dw, dh);
    ctx.globalAlpha = 1;
  }
  const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 10.125), new THREE.MeshBasicMaterial({ map: texFrom(bg.cv), toneMapped: false }));
  bgMesh.position.set(0, 0, -4);
  scene.add(bgMesh);
  const key = softKey(0xfff2e2, 2.0, v3(-3, 4, 5), 4);
  const coral = new THREE.DirectionalLight(0xed6a4e, 2.4);
  coral.position.set(3.5, 1.5, -3);
  scene.add(key, coral, new THREE.HemisphereLight(0xe8ecff, 0x0b1327, 0.8));

  // ---- three Android phones with the real store screens; home and proverb switch Tajik -> Persian
  const screens = [
    { a: img.homeTj, b: img.homeFa },
    { a: img.proverbTj, b: img.proverbFa },
    { a: img.poetTj },
  ].map((s) => {
    const c = phoneCanvas();
    return { ...s, c, tex: texFrom(c.cv), last: -1 };
  });
  function paintScreen(s, wipe) {
    const k = Math.round(wipe * 400);
    if (k === s.last) return;
    s.last = k;
    androidScreen(s.c.ctx, (ctx, w, h) => {
      ctx.fillStyle = "#F2ECDE";
      ctx.fillRect(0, 0, w, h);
      const top = 90; // 1290 - 90 = 1200 = the 1:2 store screenshot at 600 wide
      ctx.drawImage(s.a, 0, top, w, w * 2);
      if (s.b && wipe > 0) {
        const x = w * (1 - wipe);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, top, w - x, h - top);
        ctx.clip();
        ctx.drawImage(s.b, 0, top, w, w * 2);
        ctx.restore();
        if (wipe < 1) {
          ctx.fillStyle = "#ED6A4E";
          ctx.fillRect(x - 3, top, 6, h - top);
        }
      }
      statusBar(ctx, w, "#1D1A16");
    });
    s.tex.needsUpdate = true;
  }
  const bodyMat = physical(0x16171c, { metalness: 0.8, roughness: 0.3, clearcoat: 0.7 });
  const phones = screens.map((s) => {
    const p = makePhone(bodyMat, s.tex);
    scene.add(p);
    return p;
  });
  const FAN = [
    { p: v3(-1.05, -0.14, -0.35), r: v3(0, 0.32, 0.17), s: 1.0 },
    { p: v3(0, 0.06, 0.3), r: v3(0, -0.05, 0), s: 1.12 },
    { p: v3(1.05, -0.14, -0.35), r: v3(0, -0.32, -0.17), s: 1.0 },
  ];

  return function shot4(lt) {
    const fan = ease.outQuint(seg(lt, 0.1, 1.0));
    phones.forEach((ph, i) => {
      const f = FAN[i];
      ph.position.copy(v3(0, -0.25, -0.1 + 0.2 * (i === 1)).lerp(f.p, fan));
      ph.position.y += 0.025 * Math.sin(lt * 1.6 + i * 1.7);
      ph.rotation.set(-0.04, f.r.y * fan, f.r.z * fan);
      ph.scale.setScalar(lerp(0.92, f.s, fan));
    });
    paintScreen(screens[0], ease.inOutSine(seg(lt, 1.07, 1.77)));
    paintScreen(screens[1], ease.inOutSine(seg(lt, 0.95, 1.65)));
    paintScreen(screens[2], 0);
    const c = ease.inOutSine(seg(lt, 0, 2.4));
    aim(cam, v3(0.05, 0.18, 6.0).lerp(v3(-0.05, 0.06, 5.05), c), v3(0, -0.02, 0));
    // Out of black (the 8-ball that filled the frame) into the app's navy
    const exposure = 0.05 + 0.95 * ease.outCubic(seg(lt, 0, 0.32));
    return { scene, camera: cam, focus: cam.position.distanceTo(phones[1].position), aperture: 0.0012, maxblur: 0.01, bloom: 0.14, threshold: 0.95, exposure, grain: 0.016, vignette: 0.45 };
  };
}
