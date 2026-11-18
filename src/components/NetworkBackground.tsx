import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getNetworkAccent, onNetworkAccent } from "../lib/accent";
import { useTheme } from "../lib/theme";

type Palette = { dot: string; line: string; dotA: number; lineA: number; hi: string };
type Dot = {
  x: number; y: number; vx: number; vy: number; ax: number; ay: number; r: number;
  /** erkin to'rdagi o'rni va uning sekin suzishi */
  fx: number; fy: number; fvx: number; fvy: number;
  /** yozuvdagi o'rni: yozuv markaziga nisbatan siljish va chapdan o'ngga tartibi (0…1) */
  rx: number; ry: number; order: number;
  /** yozuvga yig'ilganlik darajasi (0 — erkin, 1 — yozuvda) */
  e: number;
  near: number;
};
type Magnet = { x: number; y: number; s: number };
/** Yozuv turadigan bo'sh joy (ekran koordinatalarida): markazi va o'lchami. */
type Slot = { x: number; y: number; w: number; h: number };

const WORD = "alifbit";
const FONT = (size: number) => `800 ${size}px Manrope, "Segoe UI", Arial, sans-serif`;
/** Erkin to'rda ulanish masofasi; telefonda nuqtalar kam, shuning uchun zichlik desktopdagidek qoladi. */
const FREE_LINK = 80;
const FREE_LINK_SMALL = 62;
const BUCKETS = 4;

/** "#5b8cff" → "91, 140, 255" (canvas rangiga qo'shish uchun). */
function hexToRgb(value: string): string | null {
  const hex = value.trim().replace("#", "");
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const accent = getNetworkAccent();
  const hi = hexToRgb(v(accent ? `--svc-${accent}` : "--forest-ink")) || "120, 200, 150";
  return {
    dot: v("--net-dot") || "70, 107, 80",
    line: v("--net-line") || "70, 107, 80",
    dotA: parseFloat(v("--net-dot-alpha")) || 0.5,
    lineA: parseFloat(v("--net-line-alpha")) || 0.3,
    hi,
  };
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (e: number) => e * e * (3 - 2 * e);

/** Yozuvni ko'rinmas canvasga chizib, harflar ichidagi nuqtalarni yozuv markaziga nisbatan oladi. */
function sampleWord(size: number, gap: number): [number, number][] {
  const off = document.createElement("canvas");
  const c = off.getContext("2d", { willReadFrequently: true });
  if (!c) return [];
  c.font = FONT(size);
  const cw = Math.ceil(c.measureText(WORD).width) + 24;
  const ch = Math.ceil(size * 1.4);
  off.width = cw;
  off.height = ch;
  c.font = FONT(size);
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = "#000";
  c.fillText(WORD, cw / 2, ch / 2);
  const data = c.getImageData(0, 0, cw, ch).data;
  const pts: [number, number][] = [];
  for (let y = 0; y < ch; y += gap)
    for (let x = 0; x < cw; x += gap)
      if (data[(y * cw + x) * 4 + 3] > 128)
        pts.push([x - cw / 2 + rand(-gap, gap) * 0.25, y - ch / 2 + rand(-gap, gap) * 0.25]);
  return pts;
}

/** Aniq N ta nuqta (yetmasa takrorlanadi), chapdan o'ngga tartiblangan. */
function fitPoints(pts: [number, number][], n: number): [number, number][] {
  const out = pts.slice().sort(() => Math.random() - 0.5);
  if (!out.length) out.push([0, 0]);
  const base = out.length;
  while (out.length < n) {
    const p = out[Math.floor(Math.random() * base)];
    out.push([p[0] + rand(-2, 2), p[1] + rand(-2, 2)]);
  }
  return out.slice(0, n).sort((a, b) => a[0] - b[0]);
}

/**
 * Bosh sahifada yozuv uchun joy: birinchi ekran mazmuni tugagan joy bilan «Ishlar» bo'limi matni
 * boshlangan joy orasidagi oraliq, eni — «Ishlar» matn ustuni (3D qurilmalar unga kirmaydi).
 */
function findSlot(): Slot | null {
  const top = document.querySelector(".hero")?.lastElementChild?.getBoundingClientRect();
  const col = document.querySelector('[data-stage="works"]')?.firstElementChild?.getBoundingClientRect();
  if (!top || !col) return null;
  const h = col.top - top.bottom;
  if (h < 60 || col.width < 120) return null;
  return { x: (col.left + col.right) / 2, y: (top.bottom + col.top) / 2, w: col.width, h };
}

/**
 * Butun sayt orqasidagi to'r: nuqtalar erkin suzadi va yaqinlari chiziq bilan ulanadi, kursor magnitdek
 * ularni tortib atrofida aylantiradi. Bosh sahifada birinchi ekran bilan «Ishlar» orasidagi oraliq ekran
 * o'rtasiga kelganda to'r o'sha oraliqda chapdan o'ngga «alifbit» yozuviga yig'iladi, oraliq uzoqlashganda
 * yana tarqaladi; yig'ilgan yozuv sahifa bilan birga suriladi. Harakat kamaytirilgan rejimda bitta qotgan
 * kadr chiziladi.
 */
export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const { pathname } = useLocation();
  const homeRef = useRef(pathname === "/");
  const paletteRef = useRef<Palette | null>(null);
  const redrawRef = useRef<() => void>(() => {});

  homeRef.current = pathname === "/";

  // Mavzu almashganda ranglar qayta o'qiladi (CSS o'zgaruvchilari yangilangandan keyin).
  useEffect(() => {
    paletteRef.current = readPalette();
    redrawRef.current();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const measure = document.createElement("canvas").getContext("2d");
    if (!canvas || !ctx || !measure) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let dots: Dot[] = [];
    let raf = 0;
    let last = 0;
    let clock = 0;
    let shown = 0;
    let wordSize = 0;
    let wordSpacing = 0;
    let slotPrev: Slot | null = null;
    const mouse = { x: -9999, y: -9999, on: false };

    paletteRef.current = readPalette();

    const small = () => w < 700;
    const freeLink = () => (small() ? FREE_LINK_SMALL : FREE_LINK);
    // Yozuvda nuqtalar orasidagi o'rtacha masofaga qarab: harflar ichidagi to'r uzilib qolmasin.
    const wordLink = () => Math.max(small() ? 17.5 : 22.5, wordSpacing * 2.3);

    /** Yozuv o'lchami joyga sig'adigan qilib tanlanadi; o'lcham sezilarli o'zgarsa nuqtalar qayta olinadi. */
    function fitWord(slot: Slot) {
      measure!.font = FONT(100);
      const per = measure!.measureText(WORD).width / 100 || 3.3;
      const size = Math.min(260, slot.h * 0.78, (slot.w * 0.95) / per);
      if (Math.abs(size - wordSize) < 4) return;
      wordSize = size;
      const gap = size < 120 ? 6 : size < 190 ? 8 : 10;
      const sampled = sampleWord(size, gap);
      wordSpacing = Math.sqrt((sampled.length * gap * gap) / Math.max(1, dots.length));
      const pts = fitPoints(sampled, dots.length);
      let min = Infinity;
      let max = -Infinity;
      dots.forEach((d, i) => {
        d.rx = pts[i][0];
        d.ry = pts[i][1];
        min = Math.min(min, d.rx);
        max = Math.max(max, d.rx);
      });
      for (const d of dots) d.order = (d.rx - min) / Math.max(1, max - min);
    }

    function seed() {
      const n = small() ? 220 : 560;
      dots = Array.from({ length: n }, () => {
        const fx = rand(0, w);
        const fy = rand(0, h);
        return {
          x: fx, y: fy, vx: 0, vy: 0, ax: 0, ay: 0, r: rand(0.8, 2),
          fx, fy, fvx: rand(-0.25, 0.25), fvy: rand(-0.25, 0.25),
          rx: 0, ry: 0, order: 0, e: 0, near: 0,
        };
      });
      wordSize = 0;
    }

    function resize() {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      // Telefonda manzil qatori yashirinib-chiqqanda faqat balandlik biroz o'zgaradi: nuqtalar qayta sochilmaydi.
      const reseed = Math.abs(nw - w) > 1 || !dots.length;
      w = nw;
      h = nh;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reseed) seed();
      else for (const d of dots) if (d.fy > h) d.fy = Math.random() * h;
    }

    /** Kursor magnit; sichqoncha ekrandan chiqsa, ko'rinmas magnit sekin suzib yuradi. Sensorli ekranda magnit yo'q. */
    function magnet(): Magnet | null {
      if (!fine) return null;
      if (mouse.on) return { x: mouse.x, y: mouse.y, s: 1 };
      const z = clock * 0.00006;
      return {
        x: w * (0.5 + 0.38 * Math.sin(z * 1.7 + 5.5) * Math.cos(z * 0.6)),
        y: h * (0.5 + 0.38 * Math.sin(z * 1.1 + 1.3) * Math.cos(z * 0.9 + 2)),
        s: 0.6,
      };
    }

    function pull(d: Dot, m: Magnet, radius: number) {
      const dx = m.x - d.x;
      const dy = m.y - d.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist >= radius) return 0;
      const near = 1 - dist / radius;
      let f = near * near * 1.1 * m.s;
      if (dist < 34) f = -(34 - dist) * 0.06;
      d.ax += (dx / dist) * f - (dy / dist) * near * 0.25 * m.s;
      d.ay += (dy / dist) * f + (dx / dist) * near * 0.25 * m.s;
      return near;
    }

    function step(dt: number) {
      const k = dt / 16;
      const slot = homeRef.current ? findSlot() : null;
      if (slot) fitWord(slot);
      // Oraliq ekran o'rtasiga qanchalik yaqin bo'lsa, yozuv shunchalik to'liq yig'iladi.
      const target = slot && wordSize ? clamp01((0.6 - Math.abs((slot.y - h / 2) / h)) / 0.35) : 0;
      shown += (target - shown) * Math.min(1, dt / 250);
      // Sahifa aylanganda yig'ilgan nuqtalar yozuv bilan birga suriladi (cho'zilib qolmasligi uchun).
      const shiftX = slot && slotPrev ? slot.x - slotPrev.x : 0;
      const shiftY = slot && slotPrev ? slot.y - slotPrev.y : 0;
      if (slot) slotPrev = slot;
      const cx = slotPrev ? slotPrev.x : w / 2;
      const cy = slotPrev ? slotPrev.y : h / 2;
      const m = magnet();
      const damp = Math.pow(0.88, k);
      for (const d of dots) {
        const want = clamp01(shown * 1.6 - d.order * 0.6);
        d.e += (want - d.e) * Math.min(1, dt / 200);
        d.fx += d.fvx * k;
        d.fy += d.fvy * k;
        if (d.fx < 0 || d.fx > w) d.fvx = -d.fvx;
        if (d.fy < 0 || d.fy > h) d.fvy = -d.fvy;
        const e = smooth(d.e);
        d.x += shiftX * e;
        d.y += shiftY * e;
        const hx = d.fx + (cx + d.rx - d.fx) * e;
        const hy = d.fy + (cy + d.ry - d.fy) * e;
        d.near = m ? pull(d, m, 200 + 60 * (1 - e)) : 0;
        const spring = 0.004 + 0.008 * e;
        d.ax += (hx - d.x) * spring;
        d.ay += (hy - d.y) * spring;
        d.vx = (d.vx + d.ax * k) * damp;
        d.vy = (d.vy + d.ay * k) * damp;
        d.x += d.vx * k;
        d.y += d.vy * k;
        d.ax = 0;
        d.ay = 0;
      }
    }

    /** Yaqin juftlar fazoviy katak orqali topiladi; chiziqlar shaffoflik bo'yicha guruhlab chiziladi. */
    function drawLinks(p: Palette, link: number, alpha: number) {
      const grid = new Map<string, number[]>();
      dots.forEach((d, i) => {
        const key = `${Math.floor(d.x / link)},${Math.floor(d.y / link)}`;
        const cell = grid.get(key);
        if (cell) cell.push(i);
        else grid.set(key, [i]);
      });
      const base = Array.from({ length: BUCKETS }, () => new Path2D());
      const lit = Array.from({ length: BUCKETS }, () => new Path2D());
      const max = link * link;
      dots.forEach((a, i) => {
        const cx = Math.floor(a.x / link);
        const cy = Math.floor(a.y / link);
        for (let gx = cx - 1; gx <= cx + 1; gx++)
          for (let gy = cy - 1; gy <= cy + 1; gy++) {
            const cell = grid.get(`${gx},${gy}`);
            if (!cell) continue;
            for (const j of cell) {
              if (j <= i) continue;
              const b = dots[j];
              const dsq = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
              if (dsq > max) continue;
              const s = 1 - dsq / max;
              const amt = Math.max(a.near, b.near);
              const glow = amt > 0.2;
              const bucket = Math.min(BUCKETS - 1, Math.floor((glow ? s * amt : s) * BUCKETS));
              const path = (glow ? lit : base)[bucket];
              path.moveTo(a.x, a.y);
              path.lineTo(b.x, b.y);
            }
          }
      });
      ctx!.lineWidth = 1;
      for (let b = 0; b < BUCKETS; b++) {
        const f = (b + 1) / BUCKETS;
        ctx!.strokeStyle = `rgba(${p.line}, ${f * alpha})`;
        ctx!.stroke(base[b]);
        ctx!.strokeStyle = `rgba(${p.hi}, ${f * 0.95})`;
        ctx!.stroke(lit[b]);
      }
    }

    function draw() {
      const p = paletteRef.current || readPalette();
      ctx!.clearRect(0, 0, w, h);
      let sum = 0;
      for (const d of dots) sum += smooth(d.e);
      const e = dots.length ? sum / dots.length : 0;
      drawLinks(p, freeLink() + (wordLink() - freeLink()) * e, p.lineA * (1 + 0.3 * e));

      // Uzoqdagilar bitta yo'lda nuqta; kursor yaqinidagi yoki tez uchayotganlar xizmat rangida iz bilan.
      const base = new Path2D();
      ctx!.lineCap = "round";
      for (const d of dots) {
        const speed = Math.hypot(d.vx, d.vy);
        if (d.near > 0.15 || speed > 1.2) {
          ctx!.strokeStyle = `rgba(${p.hi}, ${Math.min(1, 0.35 + d.near * 0.8)})`;
          ctx!.lineWidth = d.r * 1.4;
          ctx!.beginPath();
          ctx!.moveTo(d.x - d.vx * 3, d.y - d.vy * 3);
          ctx!.lineTo(d.x + 0.01, d.y);
          ctx!.stroke();
        } else {
          base.moveTo(d.x + d.r, d.y);
          base.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        }
      }
      ctx!.fillStyle = `rgba(${p.dot}, ${p.dotA})`;
      ctx!.fill(base);
    }

    const loop = (now: number) => {
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      clock += dt;
      step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (still || raf || document.visibilityState !== "visible") return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    redrawRef.current = () => {
      if (still || !raf) draw();
    };

    const onResize = () => {
      resize();
      if (still) draw();
    };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.on = true;
    };
    const onLeave = () => {
      mouse.on = false;
    };
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    const offAccent = onNetworkAccent(() => {
      paletteRef.current = readPalette();
      redrawRef.current();
    });

    resize();
    draw();
    start();
    // Manrope yuklangach yozuv nuqtalari qayta olinadi (birinchi o'lchashda zaxira shrift bo'lishi mumkin).
    let alive = true;
    document.fonts
      ?.load(FONT(100))
      .then(() => {
        if (alive) wordSize = 0;
      })
      .catch(() => {});
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    if (fine && !still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    return () => {
      alive = false;
      stop();
      offAccent();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="net-bg" aria-hidden="true" />;
}
