// Jomi Studio hero showreel — one Three.js canvas renders all six shots; every frame is a
// pure function of HyperFrames time (hf-seek). Shot boundaries live in CUT.
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
// Shot boundaries (s): break-open · websites · branding · apps · studio · lockup
const CUT = [0, 2.4, 5.2, 7.6, 10.0, 12.2, 15.0];
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

// Seamless-loop constants: Shot 6's last frame equals Shot 1's first frame.
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
  const [deskImg, deskTop, mobImg, mobTop, mobBot] = await Promise.all([
    load("assets/kimchi/desktop.webp"),
    load("assets/kimchi/desktop-top.png"),
    load("assets/kimchi/mobile.webp"),
    load("assets/kimchi/mobile-top.png"),
    load("assets/kimchi/mobile-bottom.png"),
  ]);
  await Promise.all([400, 500, 600, 700].map((w) => document.fonts.load(`${w} 40px "Inter Tight"`)));

  SHOTS = [
    null, // shot 1 and 6 share the dark scene
    buildWebsites(deskImg, deskTop, mobImg, mobTop, mobBot),
    buildBranding(),
    buildApps(),
    buildStudio(),
  ];
  const darkShot = buildDark();
  SHOTS[0] = darkShot.shot1;
  SHOTS[5] = darkShot.shot6;

  // Warm up shader programs so the first sampled frame of each shot is complete.
  for (let i = 0; i < 6; i++) {
    const s = SHOTS[i](i === 5 ? 2.0 : 1.0, CUT[i] + 1.0);
    renderer.compile(s.scene, s.camera);
  }
  ready = true;
  renderAt(window.__hfThreeTime || 0);
}

function renderAt(time) {
  const t = clamp(time, 0, DUR);
  let i = 5;
  for (let k = 0; k < 6; k++) {
    if (t >= CUT[k] && t < CUT[k + 1]) {
      i = k;
      break;
    }
  }
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
    // Fly-in to the lockup position (mark left of centre), staggered, sphere springs last.
    const slide = ease.inOutCubic(seg(lt, 2.4, 2.8));
    const markX = lerp(LOCK_MARK_X, 0, slide);
    for (let i = 0; i < 4; i++) {
      const d0 = i * 0.12;
      const k = seg(lt, d0, d0 + (i === 3 ? 1.05 : 0.95));
      const e = i === 3 ? ease.outBack(k, 1.4) : ease.outQuint(k);
      const target = markWorld(i, markX, 0);
      const p = FLY_FROM[i].p.clone().lerp(target, e);
      const r = FLY_FROM[i].r.clone().multiplyScalar(1 - Math.min(1, e));
      setPiece(i, p, r);
    }
    const reveal = ease.outCubic(seg(lt, 1.2, 1.85));
    paintWord(reveal);
    const fade = 1 - seg(lt, 2.35, 2.62);
    wordMesh.material.opacity = (reveal > 0 ? 1 : 0) * fade;
    wordMesh.position.set(markX + WORD_DX, WORD_DY, 0.02);
    const bloomBump = Math.sin(Math.PI * seg(lt, 1.05, 2.6));
    glow.material.opacity = glowBase(t) + 0.16 * bloomBump;
    const c = ease.outCubic(seg(lt, 0, 2.0));
    aim(cam, v3(0.45, -0.18, 7.6).lerp(P0, c), LOOK0, 0.04 * (1 - c));
    const ap = 0.0024 * (1 - ease.inOutSine(seg(lt, 0.4, 1.3)));
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

// ================================================================ Shot 3: branding (Jomi's own identity)
function buildBranding() {
  const scene = new THREE.Scene();
  scene.background = backdropTexture("#F8F3EB", "#E3D8C7");
  scene.environment = ENV;
  scene.environmentIntensity = 0.55;
  const cam = makeCamera(30);
  const key = softKey(0xfff6ea, 2.3, v3(-3.2, 4.6, 5), 5);
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0xd8cab6, 1.1));
  const catcher = shadowPlane(30, 20, 0.14);
  catcher.position.z = -2.0;
  scene.add(catcher);

  function paper(w, h, d, frontCv, side, roughness = 0.85) {
    const sideMat = new THREE.MeshStandardMaterial({ color: side, roughness });
    const front = new THREE.MeshStandardMaterial({ map: texFrom(frontCv), roughness });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [sideMat, sideMat, sideMat, sideMat, front, sideMat]);
    m.castShadow = true;
    return m;
  }
  // Letterhead: logo top-left, a quiet four-shape pattern strip, a few hairlines.
  const lh = makeCanvas(1450, 2050);
  lh.ctx.fillStyle = "#FAF6EF";
  lh.ctx.fillRect(0, 0, 1450, 2050);
  drawLogo(lh.ctx, 120, 130, 150, HEX.ink, HEX.green);
  lh.ctx.fillStyle = "rgba(31,29,36,0.14)";
  [520, 600, 680, 760, 840, 1000, 1080, 1160].forEach((y, i) => lh.ctx.fillRect(120, y, i % 4 === 3 ? 620 : 1210, 6));
  for (let i = 0; i < 12; i++) drawMark(lh.ctx, 120 + i * 102, 1860, 70, i % 3 === 1 ? HEX.green : HEX.ink, i % 3 === 1 ? HEX.ink : HEX.green);
  // Envelope (ink) with cream mark.
  const env = makeCanvas(2000, 1000);
  env.ctx.fillStyle = HEX.ink;
  env.ctx.fillRect(0, 0, 2000, 1000);
  env.ctx.strokeStyle = "rgba(246,241,233,0.12)";
  env.ctx.lineWidth = 6;
  env.ctx.beginPath();
  env.ctx.moveTo(0, 0);
  env.ctx.lineTo(1000, 560);
  env.ctx.lineTo(2000, 0);
  env.ctx.stroke();
  drawMark(env.ctx, 110, 110, 150, HEX.cream, HEX.green);
  // Business cards.
  const cardB = makeCanvas(1550, 960);
  cardB.ctx.fillStyle = "#FAF6EF";
  cardB.ctx.fillRect(0, 0, 1550, 960);
  drawLogo(cardB.ctx, (1550 - 2.815 * 280) / 2, (960 - 280) / 2, 280, HEX.ink, HEX.green);
  const cardA = makeCanvas(1550, 960);
  cardA.ctx.fillStyle = HEX.ink;
  cardA.ctx.fillRect(0, 0, 1550, 960);
  drawMark(cardA.ctx, (1550 - 240) / 2, (960 - 240) / 2, 240, HEX.cream, HEX.green);
  // Sticker (green disc, cream mark).
  const st = makeCanvas(800, 800);
  st.ctx.fillStyle = HEX.green;
  st.ctx.fillRect(0, 0, 800, 800);
  drawMark(st.ctx, 230, 230, 340, HEX.cream, HEX.cream);

  const items = [
    { m: paper(1.45, 2.05, 0.012, lh.cv, 0xf3eee6), to: v3(-1.15, 0.2, -0.9), rot: v3(0.05, 0.3, -0.08), from: v3(-0.6, 1.2, -0.6) },
    { m: paper(2.0, 1.0, 0.03, env.cv, COL.ink, 0.7), to: v3(1.0, 0.78, -0.65), rot: v3(0.1, -0.32, 0.12), from: v3(1.0, 0.9, -0.4) },
    { m: paper(1.55, 0.96, 0.018, cardB.cv, 0xf3eee6), to: v3(0.35, -0.5, 0.35), rot: v3(-0.14, -0.22, -0.06), from: v3(0.9, -0.8, 0.5) },
    { m: paper(1.55, 0.96, 0.018, cardA.cv, COL.ink, 0.7), to: v3(-0.78, -0.92, 0.78), rot: v3(0.2, 0.36, 0.18), from: v3(-0.9, -1.0, 0.6) },
  ];
  const stickerMat = new THREE.MeshStandardMaterial({ map: texFrom(st.cv), roughness: 0.5 });
  const stickerSide = new THREE.MeshStandardMaterial({ color: COL.green, roughness: 0.5 });
  const sticker = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.014, 96), [stickerSide, stickerMat, stickerSide]);
  sticker.castShadow = true;
  items.push({ m: sticker, to: v3(1.38, -0.32, 0.9), rot: v3(Math.PI / 2 - 0.25, 0.0, -0.35), from: v3(0.8, -0.5, 0.8) });
  items.forEach((it) => scene.add(it.m));

  const LOOK = v3(0, -0.1, 0);
  return function shot3(lt) {
    items.forEach((it, i) => {
      const k = ease.outCubic(seg(lt, i * 0.06, 1.6 + i * 0.06));
      const p = it.to.clone().add(it.from.clone().multiplyScalar(0.6 * (1 - k)));
      p.y += 0.04 * Math.sin(lt * 1.7 + i * 1.3);
      it.m.position.copy(p);
      it.m.rotation.set(it.rot.x + 0.35 * (1 - k) * (i % 2 ? 1 : -1), it.rot.y + 0.5 * (1 - k), it.rot.z + 0.05 * Math.sin(lt * 1.2 + i));
    });
    // Seam: the ink card flips toward the lens and fills the frame on the cut.
    const flip = ease.inCubic(seg(lt, 1.95, 2.4));
    const card = items[3].m;
    card.position.lerp(v3(0.1, 0.05, 4.4), flip);
    card.rotation.y += Math.PI * flip;
    const c = ease.inOutSine(seg(lt, 0, 2.4));
    aim(cam, v3(0.35, 0.25, 6.5).lerp(v3(-0.2, -0.05, 5.5), c), LOOK, 0.03 * c);
    return { scene, camera: cam, focus: cam.position.distanceTo(items[2].m.position), aperture: 0.0022, maxblur: 0.012, bloom: 0.12, threshold: 0.95, exposure: 1.02, grain: 0.014, vignette: 0.35 };
  };
}

// ================================================================ Shot 4: apps (unnamed concept)
function buildApps() {
  const scene = new THREE.Scene();
  scene.background = backdropTexture("#63D6AC", "#37A47C");
  scene.environment = ENV;
  scene.environmentIntensity = 0.7;
  const cam = makeCamera(30);
  const key = softKey(0xffffff, 2.0, v3(-2.5, 4, 5.5), 4);
  const rim = new THREE.DirectionalLight(0xfff4e4, 1.6);
  rim.position.set(3, 2, -3);
  scene.add(key, rim, new THREE.HemisphereLight(0xffffff, 0x2f8c69, 0.9));
  const catcher = shadowPlane(30, 20, 0.16);
  catcher.position.z = -1.6;
  scene.add(catcher);

  // Ghost brand shapes drifting in the background.
  const ghostMat = new THREE.MeshBasicMaterial({ color: COL.cream, transparent: true, opacity: 0.13, depthWrite: false });
  const ghosts = [
    new THREE.Mesh(new THREE.ShapeGeometry(roundedRectShape(1, 1, 0.01), 4), ghostMat),
    new THREE.Mesh(new THREE.ShapeGeometry(roundedRectShape(1, 1, 0.2), 16), ghostMat),
    new THREE.Mesh(new THREE.ShapeGeometry(roundedRectShape(1, 1, 0.36), 16), ghostMat),
    new THREE.Mesh(new THREE.CircleGeometry(0.5, 64), ghostMat),
  ];
  const GHOST_AT = [v3(-3.6, 1.6, -3), v3(3.4, 1.9, -3.2), v3(-3.1, -1.8, -2.8), v3(3.5, -1.5, -3)];
  ghosts.forEach((g) => {
    g.scale.setScalar(2.2);
    scene.add(g);
  });

  // Concept app screen: cream UI, ink type, green accents. Progress ring counts up.
  const app = phoneCanvas();
  const appTex = texFrom(app.cv);
  function paintApp(progress) {
    phoneScreen(app.ctx, (ctx, w, h) => {
      ctx.fillStyle = HEX.cream;
      ctx.fillRect(0, 0, w, h);
      statusBar(ctx, w, HEX.ink);
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = HEX.muted;
      ctx.font = '500 28px "Inter Tight"';
      ctx.fillText("Tuesday", 48, 160);
      ctx.fillStyle = HEX.ink;
      ctx.font = '700 64px "Inter Tight"';
      ctx.fillText("Your day", 46, 232);
      // ring
      const cx = 300;
      const cy = 480;
      ctx.lineCap = "round";
      ctx.lineWidth = 34;
      ctx.strokeStyle = "#E6DED1";
      ctx.beginPath();
      ctx.arc(cx, cy, 150, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = HEX.green;
      ctx.beginPath();
      ctx.arc(cx, cy, 150, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.72 * progress);
      ctx.stroke();
      ctx.fillStyle = HEX.ink;
      ctx.textAlign = "center";
      ctx.font = '700 84px "Inter Tight"';
      ctx.fillText(`${Math.round(72 * progress)}%`, cx, cy + 22);
      ctx.fillStyle = HEX.muted;
      ctx.font = '500 26px "Inter Tight"';
      ctx.fillText("Daily focus", cx, cy + 66);
      ctx.textAlign = "left";
      // cards
      [
        { y: 690, title: "Deep work", sub: "2h 40m", icon: "circle" },
        { y: 862, title: "Reading", sub: "24 pages", icon: "square" },
      ].forEach((c) => {
        ctx.fillStyle = "#FFFFFF";
        rr(ctx, 40, c.y, 520, 150, 36);
        ctx.fill();
        ctx.fillStyle = c.icon === "circle" ? HEX.green : HEX.ink;
        if (c.icon === "circle") {
          ctx.beginPath();
          ctx.arc(110, c.y + 75, 32, 0, Math.PI * 2);
          ctx.fill();
        } else {
          rr(ctx, 78, c.y + 43, 64, 64, 14);
          ctx.fill();
        }
        ctx.fillStyle = HEX.ink;
        ctx.font = '600 34px "Inter Tight"';
        ctx.fillText(c.title, 172, c.y + 68);
        ctx.fillStyle = HEX.muted;
        ctx.font = '500 26px "Inter Tight"';
        ctx.fillText(c.sub, 172, c.y + 108);
      });
      // button
      ctx.fillStyle = HEX.ink;
      rr(ctx, 40, 1046, 520, 104, 52);
      ctx.fill();
      ctx.fillStyle = HEX.cream;
      ctx.textAlign = "center";
      ctx.font = '600 36px "Inter Tight"';
      ctx.fillText("Start session", 300, 1110);
      ctx.textAlign = "left";
      // tab bar: the four brand shapes as icons
      const icons = [
        (x) => rr(ctx, x, 1196, 40, 40, 0),
        (x) => rr(ctx, x, 1196, 40, 40, 9),
        (x) => rr(ctx, x, 1196, 40, 40, 15),
        (x) => {
          ctx.beginPath();
          ctx.arc(x + 20, 1216, 20, 0, Math.PI * 2);
        },
      ];
      icons.forEach((draw, i) => {
        ctx.fillStyle = i === 3 ? HEX.green : "rgba(31,29,36,0.35)";
        draw(110 + i * 115);
        ctx.fill();
      });
    });
    appTex.needsUpdate = true;
  }

  const phone = makePhone(physical(COL.ink, { roughness: 0.22, metalness: 0.4, clearcoat: 1 }), appTex);
  scene.add(phone);

  // Floating UI cards (transparent canvases with soft shadows drawn in).
  function cardCanvas(w, h, paint) {
    const S = 1.6; // backing-store scale
    const { cv, ctx } = makeCanvas(Math.round(w * S), Math.round(h * S));
    ctx.scale(S, S);
    ctx.shadowColor = "rgba(20,40,30,0.25)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = "#FFFFFF";
    rr(ctx, 24, 18, w - 48, h - 54, 34);
    ctx.fill();
    ctx.shadowColor = "transparent";
    paint(ctx, w, h);
    return cv;
  }
  const chart = cardCanvas(560, 380, (ctx) => {
    ctx.fillStyle = HEX.ink;
    ctx.font = '600 30px "Inter Tight"';
    ctx.fillText("This week", 58, 82);
    [0.45, 0.7, 0.55, 0.9, 0.62, 0.8, 0.5].forEach((v, i) => {
      ctx.fillStyle = i === 3 ? HEX.green : "#E6DED1";
      const bh = 180 * v;
      rr(ctx, 60 + i * 64, 300 - bh, 40, bh, 12);
      ctx.fill();
    });
  });
  const toggle = cardCanvas(560, 190, (ctx) => {
    ctx.fillStyle = HEX.ink;
    ctx.font = '600 32px "Inter Tight"';
    ctx.fillText("Reminders", 60, 100);
    ctx.fillStyle = HEX.green;
    rr(ctx, 400, 62, 100, 56, 28);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(472, 90, 22, 0, Math.PI * 2);
    ctx.fill();
  });
  const chips = cardCanvas(600, 190, (ctx) => {
    ctx.font = '600 28px "Inter Tight"';
    [
      ["Calm", 58, false],
      ["Focus", 218, true],
      ["Energy", 392, false],
    ].forEach(([label, x, on]) => {
      ctx.fillStyle = on ? HEX.green : "#EFE9DF";
      rr(ctx, x, 58, label.length * 19 + 52, 62, 31);
      ctx.fill();
      ctx.fillStyle = on ? "#FFFFFF" : HEX.ink;
      ctx.fillText(label, x + 26, 100);
    });
  });
  const cards = [
    { cv: chart, w: 1.12, to: v3(-1.05, 0.6, 0.45), ry: 0.25 },
    { cv: toggle, w: 1.12, to: v3(1.0, 0.2, 0.65), ry: -0.28 },
    { cv: chips, w: 1.2, to: v3(-0.92, -0.72, 0.85), ry: 0.22 },
  ].map((c) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(c.w, (c.w * c.cv.height) / c.cv.width),
      new THREE.MeshBasicMaterial({ map: texFrom(c.cv), transparent: true, toneMapped: false, depthWrite: false }),
    );
    scene.add(m);
    return { ...c, m };
  });

  const LOOK = v3(0, 0, 0);
  return function shot4(lt) {
    paintApp(ease.outCubic(seg(lt, 0.2, 1.6)));
    const turn = ease.outCubic(seg(lt, 0, 1.8));
    const spin = ease.inCubic(seg(lt, 2.0, 2.4));
    phone.rotation.set(-0.05 + 0.04 * Math.sin(lt * 1.3), lerp(-0.75, -0.12, turn) + 1.7 * spin, 0.03);
    phone.position.set(0, lerp(-0.35, 0, turn) + 0.03 * Math.sin(lt * 1.7), 0);
    cards.forEach((c, i) => {
      const k = seg(lt, 0.55 + i * 0.14, 1.3 + i * 0.14);
      const e = ease.outBack(k, 1.5);
      const p = v3(0, 0, 0.06).lerp(c.to, e);
      p.y += 0.04 * Math.sin(lt * 1.6 + i * 2.1) * k;
      p.multiplyScalar(1 + 0.6 * spin);
      c.m.position.copy(p);
      c.m.scale.setScalar(Math.max(0.001, lerp(0.15, 1, clamp(e, 0, 1.2))));
      c.m.rotation.set(0, c.ry * k, 0);
      c.m.visible = lt >= 0.55 + i * 0.14;
    });
    ghosts.forEach((g, i) => {
      g.position.copy(GHOST_AT[i]).add(v3(0.15 * Math.sin(lt * 0.8 + i), 0.12 * Math.cos(lt * 0.7 + i * 2), 0));
      g.rotation.z = 0.2 * Math.sin(lt * 0.5 + i) + i * 0.3;
    });
    const c = ease.inOutSine(seg(lt, 0, 2.4));
    aim(cam, v3(0.3, 0.28, 5.7).lerp(v3(-0.1, 0.06, 5.0), c), LOOK);
    return { scene, camera: cam, focus: cam.position.length(), aperture: 0.0016, maxblur: 0.01, bloom: 0.12, threshold: 0.96, exposure: 1.0, grain: 0.014, vignette: 0.4 };
  };
}

// ================================================================ Shot 5: studio (3D & motion)
function buildStudio() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xece3d5);
  scene.fog = new THREE.Fog(0xece3d5, 7, 16);
  scene.environment = ENV;
  scene.environmentIntensity = 0.65;
  const cam = makeCamera(30);
  const key = softKey(0xfff1de, 2.4, v3(-3.2, 6, 3.2), 4);
  scene.add(key, new THREE.HemisphereLight(0xfff8ee, 0xdccdb6, 0.85));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0xede4d6, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const S = 0.9;
  const inkMatte = new THREE.MeshStandardMaterial({ color: COL.ink, roughness: 0.72 });
  const creamMatte = new THREE.MeshStandardMaterial({ color: 0xfbf7f0, roughness: 0.55 });
  const square = new THREE.Mesh(GEO.sq, inkMatte);
  square.scale.setScalar(S);
  square.position.set(-1.1, 0.5 * S, -0.4);
  square.rotation.y = 0.5;
  const r9 = new THREE.Mesh(GEO.r9, creamMatte);
  r9.scale.setScalar(S);
  r9.position.set(-0.15, 0.43, -1.05);
  r9.rotation.set(-0.12, -0.35, 0.08);
  const r16 = new THREE.Mesh(GEO.r16, inkMatte);
  r16.scale.setScalar(S);
  r16.rotation.set(-Math.PI / 2, 0, 0.4);
  r16.position.set(1.45, 0.135, -0.55);
  const glass = new THREE.Mesh(
    GEO.ball,
    new THREE.MeshPhysicalMaterial({
      color: 0xbff0db,
      transmission: 1,
      thickness: 0.9,
      ior: 1.45,
      roughness: 0.03,
      attenuationColor: new THREE.Color(COL.green),
      attenuationDistance: 0.8,
      clearcoat: 1,
      specularIntensity: 1,
    }),
  );
  glass.scale.setScalar(S);
  [square, r9, r16, glass].forEach((m) => {
    m.castShadow = true;
    scene.add(m);
  });
  const RADIUS = 0.5 * S;

  return function shot5(lt) {
    const roll = ease.outCubic(seg(lt, 0, 1.6));
    const x = lerp(3.0, 0.62, roll);
    glass.position.set(x, RADIUS, 0.3);
    glass.rotation.set(0, 0, -(x - 3.0) / RADIUS);
    const c = ease.inOutSine(seg(lt, 0, 2.2));
    const tilt = ease.inCubic(seg(lt, 1.85, 2.2));
    const pos = v3(2.2, 0.78, 5.7).lerp(v3(0.55, 0.66, 5.0), c).lerp(v3(0.7, 1.05, 3.3), tilt);
    const look = v3(0.35, 0.38, -0.3).lerp(v3(0.15, 0.4, -0.3), c).lerp(v3(0.6, 0.25, 0.3), tilt);
    aim(cam, pos, look);
    return { scene, camera: cam, focus: cam.position.distanceTo(glass.position), aperture: 0.0026, maxblur: 0.012, bloom: 0.1, threshold: 0.97, exposure: 0.98, grain: 0.012, vignette: 0.32 };
  };
}
