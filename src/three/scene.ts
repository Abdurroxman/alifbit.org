import {
  ACESFilmicToneMapping,
  Box3,
  CanvasTexture,
  ClampToEdgeWrapping,
  DirectionalLight,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  Raycaster,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader, type GLTFLoaderPlugin, type GLTFParser } from "three/addons/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  drawScreen,
  IMAGE_SCREENS,
  isImageScreen,
  SCREEN_SIZE,
  type Device,
  type ScreenKey,
  type ScreenTheme,
} from "./screens";
import type { StageFocus, StageHandle, StageState } from "./types";

/** [x, y, z, burilish (rad), o'lcham] */
type Place = [number, number, number, number, number];
type Pose = { laptop: Place; phone: Place; ls: ScreenKey; ps: ScreenKey };

const FOCUS_POSES: Record<StageFocus, Pose> = {
  idle: { laptop: [-0.35, 0, 0, 0.32, 1], phone: [1.45, 0.06, 0.9, -0.42, 1], ls: "home", ps: "home" },
  unknown: { laptop: [-0.35, 0, 0, 0.32, 1], phone: [1.45, 0.06, 0.9, -0.42, 1], ls: "home", ps: "home" },
  web: { laptop: [-0.15, 0, 0.25, 0.18, 1.1], phone: [1.6, 0.04, 0.6, -0.5, 0.82], ls: "web", ps: "web" },
  design: { laptop: [-0.15, 0, 0.25, 0.42, 1.08], phone: [1.55, 0.04, 0.7, -0.3, 0.85], ls: "design", ps: "design" },
  telegram: { laptop: [-0.8, 0, -0.7, 0.55, 0.88], phone: [0.7, 0.18, 1.35, -0.18, 1.28], ls: "telegram", ps: "telegram" },
  app: { laptop: [-0.2, 0, 0.2, 0.25, 1.1], phone: [1.5, 0.04, 0.8, -0.45, 0.9], ls: "app", ps: "app" },
  ai: { laptop: [-0.8, 0, -0.7, 0.5, 0.9], phone: [0.72, 0.18, 1.35, -0.2, 1.28], ls: "ai", ps: "ai" },
  integration: { laptop: [-0.45, 0, -0.15, 0.38, 1], phone: [1.0, 0.12, 1.2, -0.28, 1.15], ls: "integration", ps: "integration" },
  seo: { laptop: [-0.15, 0, 0.25, 0.22, 1.12], phone: [1.6, 0.04, 0.6, -0.5, 0.82], ls: "seo", ps: "seo" },
  support: { laptop: [-0.2, 0, 0.2, 0.3, 1.08], phone: [1.5, 0.04, 0.8, -0.45, 0.88], ls: "support", ps: "support" },
  audit: { laptop: [-0.15, 0, 0.25, 0.26, 1.1], phone: [1.55, 0.04, 0.7, -0.45, 0.86], ls: "audit", ps: "audit" },
  ads: { laptop: [-0.8, 0, -0.7, 0.5, 0.9], phone: [0.72, 0.18, 1.35, -0.2, 1.28], ls: "ads", ps: "ads" },
  course: { laptop: [-0.2, 0, 0.2, 0.1, 1.1], phone: [1.55, 0.04, 0.75, -0.55, 0.85], ls: "course", ps: "course" },
};

/** «Qilgan ishlarimiz»: har bir ish o'z ekranida. Noma'lum ish — boshlang'ich holat. */
const WORK_POSES: Record<string, Pose> = {
  dalolat: { laptop: [-0.7, 0, -0.5, 0.45, 0.9], phone: [0.7, 0.18, 1.3, -0.2, 1.3], ls: "dalolat-site", ps: "dalolat-feed" },
  voice: { laptop: [-0.1, 0, 0.3, 0.2, 1.12], phone: [1.6, 0.04, 0.6, -0.5, 0.8], ls: "sado", ps: "sado" },
  "dalolat-site": { laptop: [-0.1, 0, 0.3, 0.28, 1.12], phone: [1.6, 0.04, 0.7, -0.45, 0.85], ls: "dalolat-site", ps: "dalolat-feed" },
};

/**
 * Telefon noutbuk korpusiga kirib ketmasligi uchun: telefon izi (yuqoridan qaraganda to'rtburchak)
 * noutbukning old chetidan oldinda bo'lmasa, noutbuk o'qi bo'ylab oldinga suriladi.
 * O'lchamlar sahna birligida, o'lcham 1 da: noutbuk eni ±1,5, old cheti z=1,03; telefon eni ±0,47, qalinligi ±0,11.
 */
const LAPTOP_HALF_W = 1.5;
const LAPTOP_FRONT = 1.03;
const PHONE_HALF_W = 0.47;
const PHONE_HALF_D = 0.11;
const DEVICE_GAP = 0.12;

function separate(p: Pose): Pose {
  const [lx, , lz, ly, ls] = p.laptop;
  const [px, py, pz, pyaw, ps] = p.phone;
  const lc = Math.cos(ly);
  const lsn = Math.sin(ly);
  const pc = Math.cos(pyaw);
  const psn = Math.sin(pyaw);
  let minX = Infinity;
  let minZ = Infinity;
  for (const [cx, cz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    // Telefon burchagi dunyoda, keyin noutbukning o'z koordinatalarida (Y atrofida burilish: x' = x·cos + z·sin).
    const ox = cx * PHONE_HALF_W * ps;
    const oz = cz * PHONE_HALF_D * ps;
    const wx = px + ox * pc + oz * psn - lx;
    const wz = pz - ox * psn + oz * pc - lz;
    minX = Math.min(minX, (wx * lc - wz * lsn) / ls);
    minZ = Math.min(minZ, (wx * lsn + wz * lc) / ls);
  }
  if (minX >= LAPTOP_HALF_W + DEVICE_GAP) return p;
  const shift = LAPTOP_FRONT + DEVICE_GAP - minZ;
  if (shift <= 0) return p;
  return { ...p, phone: [px + shift * ls * lsn, py, pz + shift * ls * lc, pyaw, ps] };
}
for (const poses of [FOCUS_POSES, WORK_POSES] as Record<string, Pose>[]) for (const k in poses) poses[k] = separate(poses[k]);

const LID_OPEN = -0.26;
const LID_CLOSED = Math.PI / 2 - 0.02;
// Kompozitsiya chegarasi (dunyo birligida): kamera masofasi shunga qarab tanlanadi.
const SPAN_W = 4.7;
const SPAN_H = 3.4;
const FOV = 30;
const MAX_PIXELS = 4_200_000;

/** Admin yuklagan skrinshot (xizmat misollari): ekranga to'g'ridan-to'g'ri rasm sifatida qo'yiladi. */
type MediaKey = `/media/${string}`;
type ShownKey = ScreenKey | MediaKey;
type SlideUniforms = { prevMap: { value: Texture | null }; uSlide: { value: number }; uSpan: { value: Vector2 } };
/** slide: 0 → 1 — almashish jarayoni; 1 bo'lsa ekranda faqat joriy rasm turadi. */
type Screen = { mat: MeshBasicMaterial; u: SlideUniforms; key: ShownKey | null; next: ShownKey; slide: number };
/** Misollar skrinshotlari ekranda shuncha vaqtdan keyin almashadi. */
const SHOT_INTERVAL = 4000;
/** Yangi rasm o'ngdan surilib kirishi shuncha soniya davom etadi. */
const SLIDE_TIME = 0.65;

function isMediaKey(key: ShownKey): key is MediaKey {
  return key.startsWith("/media/");
}

/**
 * Ekran materiali ikki rasmni bir vaqtda chizadi: eskisi (prevMap) chapga surilib chiqadi,
 * yangisi (map) o'ng tomondan kiradi. uSpan — ekran UV'sining gorizontal boshi va eni
 * (telefon modeli ekrani UV'ning bir qismini egallashi mumkin).
 */
function slideScreen(): Pick<Screen, "mat" | "u"> {
  const u: SlideUniforms = { prevMap: { value: null }, uSlide: { value: 1 }, uSpan: { value: new Vector2(0, 1) } };
  const mat = new MeshBasicMaterial({ toneMapped: false });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D prevMap;\nuniform float uSlide;\nuniform vec2 uSpan;")
      .replace(
        "#include <map_fragment>",
        `#ifdef USE_MAP
  float shift = 1.0 - uSlide;
  vec4 nextTexel = texture2D(map, vec2(vMapUv.x - shift * uSpan.y, vMapUv.y));
  vec4 prevTexel = texture2D(prevMap, vec2(vMapUv.x + uSlide * uSpan.y, vMapUv.y));
  float sx = (vMapUv.x - uSpan.x) / uSpan.y;
  diffuseColor *= mix(nextTexel, prevTexel, step(sx, shift));
#endif`,
      );
  };
  return { mat, u };
}

/** Sekin boshlanib, sekin to'xtaydi. */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
type DeviceName = "laptop" | "phone";

// Modellar (public/models). O'lchamlar metrda, glTF koordinatalarida (Y — yuqoriga).
const LAPTOP_URL = "/models/macbook.glb";
const PHONE_URL = "/models/iphone.glb";
/** MacBook: kengligi 0,3579 m (Z o'qi bo'ylab), old tomoni −X; qopqoq tuguni ilmoq o'qida turadi. */
const LAPTOP_WIDTH = 0.3579;
const LAPTOP_LID = "Ecran_6";
/** Qopqoq teksturasidagi ekran maydoni (model koordinatalarida): old yuz x=0,12504. */
const LAPTOP_SCREEN = { x: 0.12504, y0: 0.0303, y1: 0.2351, z0: -0.1733, z1: 0.1731 };
/** iPhone: balandligi 0,1634 m, old tomoni +Z, pastki cheti y=0; ekran — alohida tugun. */
const PHONE_HEIGHT = 0.1634;
const PHONE_SCREEN = "Front_Screen";
/** Qo'yib yuborilgach qurilma shuncha vaqt kutadi, keyin o'z holatiga qaytadi. */
const RETURN_DELAY = 1200;

const WRAP: Record<number, number> = { 33071: ClampToEdgeWrapping, 33648: MirroredRepeatWrapping, 10497: RepeatWrapping };
const FILTER: Record<number, number> = { 9728: NearestFilter, 9729: LinearFilter };

/**
 * GLB ichidagi rasmlarni `blob:` manzilsiz o'qiydi: sayt CSP'si img-src ga faqat 'self' va data: ruxsat beradi,
 * GLTFLoader esa odatda rasmni blob URL orqali yuklaydi. createImageBitmap baytlardan to'g'ridan-to'g'ri ochadi.
 */
function bitmapTextures(parser: GLTFParser): GLTFLoaderPlugin {
  return {
    name: "alifbit_bitmap_textures",
    loadTexture(index: number) {
      const json = parser.json;
      const def = json.textures[index];
      const image = json.images[def.source];
      if (image?.bufferView === undefined || typeof createImageBitmap !== "function") return null;
      return parser
        .getDependency("bufferView", image.bufferView)
        .then((buf: ArrayBuffer) =>
          createImageBitmap(new Blob([buf], { type: image.mimeType }), {
            imageOrientation: "none",
            premultiplyAlpha: "none",
            colorSpaceConversion: "none",
          }),
        )
        .then((bitmap: ImageBitmap) => {
          const t = new Texture(bitmap);
          const sampler = (json.samplers || [])[def.sampler] || {};
          t.flipY = false;
          t.magFilter = (FILTER[sampler.magFilter] ?? LinearFilter) as typeof t.magFilter;
          t.minFilter = (sampler.minFilter === undefined ? LinearMipmapLinearFilter : FILTER[sampler.minFilter] ?? LinearMipmapLinearFilter) as typeof t.minFilter;
          t.wrapS = (WRAP[sampler.wrapS] ?? RepeatWrapping) as typeof t.wrapS;
          t.wrapT = (WRAP[sampler.wrapT] ?? RepeatWrapping) as typeof t.wrapT;
          t.needsUpdate = true;
          parser.associations.set(t, { textures: index });
          return t;
        });
    },
  } as GLTFLoaderPlugin;
}

function currentTheme(): ScreenTheme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function roundedShadow(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  r.addColorStop(0, "rgba(28, 44, 36, 0.42)");
  r.addColorStop(0.55, "rgba(28, 44, 36, 0.14)");
  r.addColorStop(1, "rgba(28, 44, 36, 0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

let shared: StageHandle | null = null;

/**
 * Sahna sahifa davomida bitta: bosh sahifaga qaytilganda yangi WebGL konteksti ochilmaydi,
 * mavjud canvas yangi joyga ulanadi. Kontekst yaratish qimmat va ba'zi qurilmalarda sekin.
 */
export function getScene(opts: { docked: boolean; reducedMotion: boolean }): StageHandle {
  shared ||= createScene(opts);
  shared.setDocked(opts.docked);
  return shared;
}

function createScene(opts: { docked: boolean; reducedMotion: boolean }): StageHandle {
  const canvas = document.createElement("canvas");
  let docked = opts.docked;
  let still = opts.reducedMotion;
  // Kuchsiz qurilma himoyasi: kadrlar sekin chizilsa, avval aniqlik pasayadi, keyin doimiy harakat to'xtaydi.
  let quality = 1;
  let slowFrames = 0;
  let sampled = 0;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.85;
  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(3, 6, 5);
  scene.add(sun);

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 80);
  const root = new Group();
  scene.add(root);


  const textures = new Map<string, Texture>();
  const loader = new TextureLoader();
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  // Telefon ekrani modelning o'z UV'sida (glTF: v yuqoridan pastga), noutbuk ekrani — oddiy tekislik.
  const flip: Record<Device, boolean> = { laptop: true, phone: true };
  /** Skrinshot ekran nisbatiga «cover» qilib, yuqori chetidan kesiladi: rasm cho'zilmaydi. */
  function mediaTexture(url: string, device: Device): Texture {
    const [w, h] = SCREEN_SIZE[device];
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#0d0f0e";
    c.fillRect(0, 0, w, h);
    const t = new CanvasTexture(canvas);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * k;
      c.drawImage(img, (w - dw) / 2, 0, dw, img.naturalHeight * k);
      t.needsUpdate = true;
      requestRender();
    };
    img.src = url;
    return t;
  }
  function texture(key: ShownKey, device: Device): Texture {
    const theme = currentTheme();
    const id =
      isMediaKey(key) || isImageScreen(key) ? `${key}-${device}-${flip[device]}` : `${key}-${device}-${theme}-${flip[device]}`;
    let t = textures.get(id);
    if (t) return t;
    if (isMediaKey(key)) {
      t = mediaTexture(key, device);
    } else if (isImageScreen(key)) {
      t = loader.load(IMAGE_SCREENS[key], () => requestRender());
    } else {
      t = new CanvasTexture(drawScreen(key, device, theme));
    }
    t.flipY = flip[device];
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = maxAniso;
    textures.set(id, t);
    return t;
  }

  // Noutbuk: korpus, klaviatura maydoni, qopqoq (orqa chetidan ochiladi) va ekran.
  const aluminium = new MeshStandardMaterial({ color: 0xcfd2cb, metalness: 0.78, roughness: 0.3 });
  const deck = new MeshStandardMaterial({ color: 0x2b302d, metalness: 0.2, roughness: 0.75 });
  const glass = new MeshStandardMaterial({ color: 0x0e1210, metalness: 0.1, roughness: 0.2 });
  const laptop = new Group();
  const base = new Mesh(new RoundedBoxGeometry(3, 0.11, 2.05, 4, 0.05), aluminium);
  base.position.y = 0.055;
  laptop.add(base);
  const keys = new Mesh(new PlaneGeometry(2.62, 0.98), deck);
  keys.rotation.x = -Math.PI / 2;
  keys.position.set(0, 0.111, -0.3);
  laptop.add(keys);
  const pad = new Mesh(new PlaneGeometry(1.0, 0.6), new MeshStandardMaterial({ color: 0xbfc3bc, metalness: 0.6, roughness: 0.4 }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.111, 0.58);
  laptop.add(pad);
  const hinge = new Group();
  hinge.position.set(0, 0.11, -1.0);
  laptop.add(hinge);
  const lid = new Mesh(new RoundedBoxGeometry(3, 1.95, 0.07, 4, 0.035), aluminium);
  lid.position.set(0, 0.975, 0);
  hinge.add(lid);
  const bezel = new Mesh(new PlaneGeometry(2.92, 1.87), glass);
  bezel.position.set(0, 0.975, 0.036);
  hinge.add(bezel);
  const laptopScreen: Screen = { ...slideScreen(), key: null, next: "home", slide: 1 };
  const lscreen = new Mesh(new PlaneGeometry(2.78, 1.74), laptopScreen.mat);
  lscreen.position.set(0, 0.99, 0.037);
  hinge.add(lscreen);
  const shadowTex = roundedShadow();
  const shadowMat = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const lshadow = new Mesh(new PlaneGeometry(4.6, 3.4), shadowMat);
  lshadow.rotation.x = -Math.PI / 2;
  lshadow.position.y = -0.01;
  laptop.add(lshadow);
  root.add(laptop);

  // Telefon: kelib chiqishi pastki chetida — «stolda» turadi va biroz orqaga qiya.
  const phone = new Group();
  const shell = new Mesh(
    new RoundedBoxGeometry(0.95, 1.95, 0.1, 6, 0.12),
    new MeshPhysicalMaterial({ color: 0x244534, metalness: 0.55, roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
  );
  shell.position.y = 0.975;
  phone.add(shell);
  const pbezel = new Mesh(new PlaneGeometry(0.9, 1.9), glass);
  pbezel.position.set(0, 0.975, 0.051);
  phone.add(pbezel);
  const phoneScreen: Screen = { ...slideScreen(), key: null, next: "home", slide: 1 };
  const pscreen = new Mesh(new PlaneGeometry(0.85, 1.82), phoneScreen.mat);
  pscreen.position.set(0, 0.975, 0.052);
  phone.add(pscreen);
  const pshadow = new Mesh(new PlaneGeometry(1.5, 0.9), shadowMat);
  pshadow.rotation.x = -Math.PI / 2;
  pshadow.position.set(0, -0.05, 0.1);
  phone.add(pshadow);
  root.add(phone);

  // Haqiqiy modellar: yuklanguncha yuqoridagi sodda shakllar turadi, yuklanmasa o'shalar qoladi.
  // Kursor bilan aylantirishda faqat shu qismlar tekshiriladi (soya tekisliklari emas).
  const hitParts: Record<DeviceName, Object3D[]> = { laptop: [base, keys, pad, hinge], phone: [shell, pbezel, pscreen] };
  let lidPivot: Object3D = hinge;
  let lidAxis: "x" | "z" = "x";
  const gltf = new GLTFLoader().register(bitmapTextures);
  gltf.load(
    LAPTOP_URL,
    ({ scene: model }) => {
      const lidNode = model.getObjectByName(LAPTOP_LID);
      if (!lidNode) return;
      model.updateMatrixWorld(true);
      // Ekran tekisligi qopqoq tuguniga bog'lanadi: qopqoq bilan birga ochilib-yopiladi.
      const sc = LAPTOP_SCREEN;
      const screen = new Mesh(new PlaneGeometry(sc.z1 - sc.z0, sc.y1 - sc.y0), laptopScreen.mat);
      screen.position.copy(lidNode.worldToLocal(new Vector3(sc.x - 0.0004, (sc.y0 + sc.y1) / 2, (sc.z0 + sc.z1) / 2)));
      const facing = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2);
      screen.quaternion.copy(lidNode.getWorldQuaternion(new Quaternion()).invert().multiply(facing));
      lidNode.add(screen);
      // Model eni sahnadagi noutbuk eniga (3) teng; old tomoni kameraga (+Z) buriladi.
      const wrap = new Group();
      wrap.rotation.y = Math.PI / 2;
      wrap.scale.setScalar(3 / LAPTOP_WIDTH);
      wrap.add(model);
      [base, keys, pad, hinge].forEach((o) => (o.visible = false));
      laptop.add(wrap);
      hitParts.laptop = [wrap];
      lidPivot = lidNode;
      lidAxis = "z";
      requestRender();
    },
    undefined,
    () => {},
  );
  gltf.load(
    PHONE_URL,
    ({ scene: model }) => {
      const screenNode = model.getObjectByName(PHONE_SCREEN);
      if (!screenNode) return;
      let u0 = Infinity;
      let u1 = -Infinity;
      screenNode.traverse((o) => {
        if (!(o as Mesh).isMesh) return;
        (o as Mesh).material = phoneScreen.mat;
        const uv = (o as Mesh).geometry.getAttribute("uv");
        for (let i = 0; uv && i < uv.count; i++) {
          u0 = Math.min(u0, uv.getX(i));
          u1 = Math.max(u1, uv.getX(i));
        }
      });
      if (u1 > u0) phoneScreen.u.uSpan.value.set(u0, u1 - u0);
      flip.phone = false;
      phoneScreen.key = null;
      const wrap = new Group();
      wrap.scale.setScalar(1.95 / PHONE_HEIGHT);
      wrap.add(model);
      [shell, pbezel, pscreen].forEach((o) => (o.visible = false));
      phone.add(wrap);
      hitParts.phone = [wrap];
      requestRender();
    },
    undefined,
    () => {},
  );

  // Holat
  let state: StageState = { section: "hero", focus: "idle", step: 1, work: null };
  let lidAngle = still ? LID_OPEN : LID_CLOSED;
  let lidTarget = LID_CLOSED;
  const openAt = performance.now() + 350;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const cur = { laptop: [...FOCUS_POSES.idle.laptop] as Place, phone: [...FOCUS_POSES.idle.phone] as Place };
  // Mehmon qurilmani surib aylantiradi; qo'yib yuborgach u biroz kutib, o'z holatiga qaytadi.
  const spin: Record<DeviceName, { yaw: number; pitch: number; releasedAt: number }> = {
    laptop: { yaw: 0, pitch: 0, releasedAt: 0 },
    phone: { yaw: 0, pitch: 0, releasedAt: 0 },
  };
  const drag = { target: null as DeviceName | null, x: 0, y: 0, id: -1 };
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const box = new Box3();

  function pose(): Pose {
    // O'z maketi yo'q ish (namuna yechim) o'z xizmat yo'nalishidagi ekran bilan ko'rsatiladi.
    if (state.section === "works" && state.work)
      return WORK_POSES[state.work] || FOCUS_POSES[state.workFocus || "idle"] || FOCUS_POSES.idle;
    return FOCUS_POSES[state.focus] || FOCUS_POSES.idle;
  }

  function applyScreen(s: Screen, device: Device) {
    if (s.key === s.next) return;
    if (s.key === null || still) {
      s.key = s.next;
      s.mat.map = texture(s.next, device);
      s.mat.needsUpdate = true;
      s.slide = 1;
      s.u.uSlide.value = 1;
    }
  }

  let sizeKey = "";
  function resize() {
    const box = canvas.parentElement;
    if (!box) return;
    const w = box.clientWidth;
    const h = box.clientHeight;
    if (!w || !h) return;
    // Piksellar soni chegaralanadi: juda katta kadr kuchsiz GPU'ni to'xtatib qo'yadi.
    const ratio = Math.min(window.devicePixelRatio || 1, docked ? 1.75 : 1.5) * quality;
    const pr = Math.min(ratio, Math.sqrt(MAX_PIXELS / (w * h)));
    // canvas.width'ga hatto o'sha qiymat berilsa ham chizish buferi qayta ajratiladi — faqat o'zgarganda.
    const key = `${w}x${h}@${pr}`;
    if (key !== sizeKey) {
      sizeKey = key;
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
    }
    camera.aspect = w / h;
    // Katta ekranda qurilmalar oynaning o'ng yarmida turadi: proyeksiya markazi o'ngga suriladi.
    const region = docked ? (w * 0.5) / h : w / h;
    const k = 2 * Math.tan(MathUtils.degToRad(FOV / 2));
    const d = Math.max(SPAN_W / (region * k), SPAN_H / k) * 1.04;
    camera.position.set(0, d * 0.2 + 0.9, d);
    camera.lookAt(0, 0.95, 0);
    if (docked) camera.setViewOffset(w, h, -w * 0.25, -h * 0.02, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    requestRender();
  }

  // Kadr sikli: sahna ko'rinib turgan va tab faol bo'lgandagina ishlaydi.
  let raf = 0;
  let last = performance.now();
  let visible = true;
  let hiddenSince = 0;
  let attached = false;
  function tick(now: number) {
    raf = 0;
    if (!attached) return;
    // rAF vaqti oldingi o'lchovdan oldin bo'lishi mumkin: manfiy qadam harakatni teskari yuboradi.
    const dt = MathUtils.clamp((now - last) / 1000, 0, 0.05);
    last = Math.max(last, now);
    const p = pose();
    const k = still ? 1 : 1 - Math.exp(-dt * 3.2);
    const boost = state.step === 3 && state.section === "hero" ? 1.04 : 1;
    (["laptop", "phone"] as const).forEach((name) => {
      const target = p[name];
      const c = cur[name];
      for (let i = 0; i < 5; i++) c[i] = MathUtils.lerp(c[i], i === 4 ? target[i] * boost : target[i], k);
    });
    if (!still && now > openAt) lidTarget = LID_OPEN;
    lidAngle = still ? LID_OPEN : MathUtils.lerp(lidAngle, lidTarget, 1 - Math.exp(-dt * 2.4));
    if (lidAxis === "x") lidPivot.rotation.x = lidAngle;
    else lidPivot.rotation.z = lidAngle;

    for (const name of ["laptop", "phone"] as const) {
      const sp = spin[name];
      if (drag.target !== name && now - sp.releasedAt > RETURN_DELAY) {
        const back = 1 - Math.exp(-dt * 2.6);
        sp.yaw = MathUtils.lerp(sp.yaw, 0, back);
        sp.pitch = MathUtils.lerp(sp.pitch, 0, back);
        if (Math.abs(sp.yaw) < 1e-4) sp.yaw = 0;
        if (Math.abs(sp.pitch) < 1e-4) sp.pitch = 0;
      }
    }

    const t = now / 1000;
    const float = still ? 0 : Math.sin(t * 0.9) * 0.05;
    laptop.position.set(cur.laptop[0], cur.laptop[1] + float, cur.laptop[2]);
    laptop.rotation.set(spin.laptop.pitch, cur.laptop[3] + spin.laptop.yaw, 0);
    laptop.scale.setScalar(cur.laptop[4]);
    phone.position.set(cur.phone[0], cur.phone[1] + (still ? 0 : Math.sin(t * 1.1 + 1.3) * 0.07), cur.phone[2]);
    phone.rotation.set(-0.12 + spin.phone.pitch, cur.phone[3] + spin.phone.yaw, still ? 0 : Math.sin(t * 0.7) * 0.02);
    phone.scale.setScalar(cur.phone[4]);

    pointer.x = MathUtils.lerp(pointer.x, pointer.tx, 1 - Math.exp(-dt * 3));
    pointer.y = MathUtils.lerp(pointer.y, pointer.ty, 1 - Math.exp(-dt * 3));
    root.rotation.y = pointer.x * 0.14;
    root.rotation.x = pointer.y * 0.05;

    // Ekran almashishi: eski maket chapga surilib chiqadi, yangisi o'ngdan kiradi.
    // Kirish suhbatida xizmat tanlanganda, uning misollari skrinshotlari navbat bilan chiqadi.
    const shots = state.section === "hero" ? state.shots : undefined;
    const turn = still ? 0 : Math.floor(now / SHOT_INTERVAL);
    for (const [s, dev] of [[laptopScreen, "laptop"], [phoneScreen, "phone"]] as const) {
      const list = (shots?.[dev] || []) as MediaKey[];
      s.next = list.length ? list[turn % list.length] : dev === "laptop" ? p.ls : p.ps;
      // Keyingi skrinshot oldindan yuklanadi: surilib kirganda bo'sh ekran ko'rinmaydi.
      if (list.length > 1) texture(list[(turn + 1) % list.length], dev);
      if (s.key === null || still) applyScreen(s, dev);
      else if (s.key !== s.next && s.slide >= 1) {
        s.u.prevMap.value = s.mat.map;
        s.key = s.next;
        s.mat.map = texture(s.next, dev);
        s.slide = 0;
      }
      if (s.slide < 1) s.slide = Math.min(1, s.slide + dt / SLIDE_TIME);
      s.u.uSlide.value = easeInOut(s.slide);
    }

    renderer.render(scene, camera);
    if (!still && dt > 0) {
      sampled++;
      if (dt > 1 / 24) slowFrames++;
      if (sampled === 90) {
        if (slowFrames > 45 && quality === 1) {
          quality = 0.6;
          resize();
        } else if (slowFrames > 45) {
          still = true;
          lidAngle = LID_OPEN;
        }
        sampled = 0;
        slowFrames = 0;
      }
    }
    if (state.section === "hidden") {
      hiddenSince ||= now;
      if (now - hiddenSince > 900) return;
    } else hiddenSince = 0;
    if (!still && visible && document.visibilityState === "visible") raf = requestAnimationFrame(tick);
  }
  function requestRender() {
    if (!raf && attached) raf = requestAnimationFrame(tick);
  }

  /** Kursor ostidagi qurilma (canvas sahifa ostida bo'lgani uchun nur bilan aniqlanadi). */
  function deviceAt(x: number, y: number): DeviceName | null {
    const r = canvas.getBoundingClientRect();
    if (!r.width || x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    let best: DeviceName | null = null;
    let bestD = Infinity;
    for (const name of ["phone", "laptop"] as const) {
      for (const part of hitParts[name]) {
        if (!part.visible) continue;
        box.setFromObject(part);
        const hit = raycaster.ray.intersectBox(box, new Vector3());
        if (hit) {
          const d = hit.distanceTo(raycaster.ray.origin);
          if (d < bestD) {
            bestD = d;
            best = name;
          }
        }
      }
    }
    return best;
  }
  let hoverAt = 0;
  const html = document.documentElement;
  const onPointer = (e: PointerEvent) => {
    if (fine) {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }
    if (drag.target && e.pointerId === drag.id) {
      const sp = spin[drag.target];
      sp.yaw += (e.clientX - drag.x) * 0.011;
      sp.pitch = MathUtils.clamp(sp.pitch + (e.clientY - drag.y) * 0.005, -0.45, 0.45);
      drag.x = e.clientX;
      drag.y = e.clientY;
      requestRender();
      return;
    }
    if (e.pointerType === "mouse" && e.timeStamp - hoverAt > 80) {
      hoverAt = e.timeStamp;
      html.classList.toggle("stage-grab", !!deviceAt(e.clientX, e.clientY));
    }
  };
  const onDown = (e: PointerEvent) => {
    if (still || !e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
    const target = deviceAt(e.clientX, e.clientY);
    if (!target) return;
    // Sichqonchada matn belgilanib ketmasin; barmoqda vertikal surish sahifani aylantiraveradi.
    if (e.pointerType === "mouse") e.preventDefault();
    drag.target = target;
    drag.id = e.pointerId;
    drag.x = e.clientX;
    drag.y = e.clientY;
    html.classList.add("stage-grabbing");
    requestRender();
  };
  const onUp = (e: PointerEvent) => {
    if (!drag.target || e.pointerId !== drag.id) return;
    const sp = spin[drag.target];
    // Qaytishda eng qisqa yo'l tanlanadi: bir necha marta aylantirilgan bo'lsa ham.
    sp.yaw = MathUtils.euclideanModulo(sp.yaw + Math.PI, Math.PI * 2) - Math.PI;
    sp.releasedAt = performance.now();
    drag.target = null;
    html.classList.remove("stage-grabbing");
    requestRender();
  };
  // Mavzu almashganda ekranlar yangi ranglarda qayta chiziladi.
  const themeWatch = new MutationObserver(() => {
    laptopScreen.key = null;
    phoneScreen.key = null;
    requestRender();
  });
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const onVisibility = () => {
    last = performance.now();
    requestRender();
  };
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) onVisibility();
  });
  const ro = new ResizeObserver(resize);

  return {
    attach(parent) {
      if (attached) return;
      attached = true;
      parent.appendChild(canvas);
      if (!still) {
        window.addEventListener("pointermove", onPointer, { passive: true });
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
      }
      themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      document.addEventListener("visibilitychange", onVisibility);
      io.observe(canvas);
      ro.observe(parent);
      last = performance.now();
      resize();
      requestRender();
    },
    detach() {
      if (!attached) return;
      attached = false;
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      themeWatch.disconnect();
      html.classList.remove("stage-grab", "stage-grabbing");
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      ro.disconnect();
      canvas.remove();
    },
    set(next) {
      state = next;
      requestRender();
    },
    setDocked(value) {
      if (docked === value) return;
      docked = value;
      resize();
    },
  };
}
