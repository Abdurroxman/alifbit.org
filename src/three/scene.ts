import {
  ACESFilmicToneMapping,
  CanvasTexture,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
  type Texture,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { drawScreen, IMAGE_SCREENS, isImageScreen, type Device, type ScreenKey } from "./screens";
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
  course: { laptop: [-0.2, 0, 0.2, 0.1, 1.1], phone: [1.55, 0.04, 0.75, -0.55, 0.85], ls: "course", ps: "course" },
};

/** «Qilgan ishlarimiz»: har bir ish o'z ekranida. Noma'lum ish — boshlang'ich holat. */
const WORK_POSES: Record<string, Pose> = {
  dalolat: { laptop: [-0.7, 0, -0.5, 0.45, 0.9], phone: [0.7, 0.18, 1.3, -0.2, 1.3], ls: "dalolat-site", ps: "dalolat-feed" },
  voice: { laptop: [-0.1, 0, 0.3, 0.2, 1.12], phone: [1.6, 0.04, 0.6, -0.5, 0.8], ls: "sado", ps: "sado" },
  "dalolat-site": { laptop: [-0.1, 0, 0.3, 0.28, 1.12], phone: [1.6, 0.04, 0.7, -0.45, 0.85], ls: "dalolat-site", ps: "dalolat-feed" },
  "sado-site": { laptop: [-0.1, 0, 0.3, 0.1, 1.12], phone: [1.6, 0.04, 0.6, -0.6, 0.82], ls: "sado-site", ps: "sado" },
};

const LID_OPEN = -0.26;
const LID_CLOSED = Math.PI / 2 - 0.02;
// Kompozitsiya chegarasi (dunyo birligida): kamera masofasi shunga qarab tanlanadi.
const SPAN_W = 4.7;
const SPAN_H = 3.4;
const FOV = 30;
const MAX_PIXELS = 4_200_000;

type Screen = { mat: MeshBasicMaterial; key: ScreenKey | null; next: ScreenKey; fade: number };

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
  function texture(key: ScreenKey, device: Device): Texture {
    const id = isImageScreen(key) ? key : `${key}-${device}`;
    let t = textures.get(id);
    if (t) return t;
    if (isImageScreen(key)) {
      t = loader.load(IMAGE_SCREENS[key], () => requestRender());
    } else {
      t = new CanvasTexture(drawScreen(key, device));
    }
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
  const laptopScreen: Screen = {
    mat: new MeshBasicMaterial({ toneMapped: false }),
    key: null,
    next: "home",
    fade: 1,
  };
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
  const phoneScreen: Screen = {
    mat: new MeshBasicMaterial({ toneMapped: false }),
    key: null,
    next: "home",
    fade: 1,
  };
  const pscreen = new Mesh(new PlaneGeometry(0.85, 1.82), phoneScreen.mat);
  pscreen.position.set(0, 0.975, 0.052);
  phone.add(pscreen);
  const pshadow = new Mesh(new PlaneGeometry(1.5, 0.9), shadowMat);
  pshadow.rotation.x = -Math.PI / 2;
  pshadow.position.set(0, -0.05, 0.1);
  phone.add(pshadow);
  root.add(phone);

  // Holat
  let state: StageState = { section: "hero", focus: "idle", step: 1, work: null };
  let lidAngle = still ? LID_OPEN : LID_CLOSED;
  let lidTarget = LID_CLOSED;
  const openAt = performance.now() + 350;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const cur = { laptop: [...FOCUS_POSES.idle.laptop] as Place, phone: [...FOCUS_POSES.idle.phone] as Place };

  function pose(): Pose {
    if (state.section === "works" && state.work) return WORK_POSES[state.work] || FOCUS_POSES.idle;
    return FOCUS_POSES[state.focus] || FOCUS_POSES.idle;
  }

  function applyScreen(s: Screen, device: Device) {
    if (s.key === s.next) return;
    if (s.key === null || still) {
      s.key = s.next;
      s.mat.map = texture(s.next, device);
      s.mat.needsUpdate = true;
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
    hinge.rotation.x = lidAngle;

    const t = now / 1000;
    const float = still ? 0 : Math.sin(t * 0.9) * 0.05;
    laptop.position.set(cur.laptop[0], cur.laptop[1] + float, cur.laptop[2]);
    laptop.rotation.y = cur.laptop[3];
    laptop.scale.setScalar(cur.laptop[4]);
    phone.position.set(cur.phone[0], cur.phone[1] + (still ? 0 : Math.sin(t * 1.1 + 1.3) * 0.07), cur.phone[2]);
    phone.rotation.set(-0.12, cur.phone[3], still ? 0 : Math.sin(t * 0.7) * 0.02);
    phone.scale.setScalar(cur.phone[4]);

    pointer.x = MathUtils.lerp(pointer.x, pointer.tx, 1 - Math.exp(-dt * 3));
    pointer.y = MathUtils.lerp(pointer.y, pointer.ty, 1 - Math.exp(-dt * 3));
    root.rotation.y = pointer.x * 0.14;
    root.rotation.x = pointer.y * 0.05;

    // Ekran almashishi: so'nib, yangi maket bilan qayta yonadi.
    for (const [s, dev] of [[laptopScreen, "laptop"], [phoneScreen, "phone"]] as const) {
      s.next = dev === "laptop" ? p.ls : p.ps;
      if (s.key === null || still) applyScreen(s, dev);
      else if (s.key !== s.next) {
        s.fade = Math.max(0, s.fade - dt * 7);
        if (s.fade === 0) {
          s.key = s.next;
          s.mat.map = texture(s.next, dev);
          s.mat.needsUpdate = true;
        }
      } else s.fade = Math.min(1, s.fade + dt * 5);
      s.mat.color.setScalar(0.12 + s.fade * 0.88);
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

  const onPointer = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
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
      if (fine && !still) window.addEventListener("pointermove", onPointer, { passive: true });
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
