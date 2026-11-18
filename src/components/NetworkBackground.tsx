import { useEffect, useRef } from "react";
import { getNetworkAccent, onNetworkAccent } from "../lib/accent";
import { useTheme } from "../lib/theme";

type Dot = { x: number; y: number; vx: number; vy: number; r: number };
type Palette = { dot: string; line: string; dotA: number; lineA: number; hi: string };

const MOUSE_RADIUS = 190;
const LINK_DIST = 132;
const PULSE_STEP = 900;
const PULSE_REST = 2600;

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

/**
 * Butun sayt orqasidagi nuqtalar to'ri: nuqtalar sekin suzadi, yaqinlari chiziq bilan ulanadi,
 * kursor yaqinidagilar undan qochadi va xizmat rangida yonadi; vaqti-vaqti bilan ulangan nuqtalar
 * bo'ylab yorug' signal yuguradi. Harakat kamaytirilgan rejimda bitta qotgan kadr chiziladi.
 */
export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const paletteRef = useRef<Palette | null>(null);
  const redrawRef = useRef<() => void>(() => {});

  // Mavzu almashganda ranglar qayta o'qiladi (CSS o'zgaruvchilari yangilangandan keyin).
  useEffect(() => {
    paletteRef.current = readPalette();
    redrawRef.current();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let dots: Dot[] = [];
    let raf = 0;
    let last = 0;
    const mouse = { x: -9999, y: -9999, on: false };
    // Signal: ulangan nuqtalar zanjiri bo'ylab yuradi, keyin dam oladi.
    let path: number[] = [];
    let elapsed = 0;
    let rest = 1200;

    paletteRef.current = readPalette();

    function seed() {
      const small = w < 700;
      const count = Math.min(small ? 56 : 140, Math.floor((w * h) / (small ? 12000 : 9000)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.36,
        vy: (Math.random() - 0.5) * 0.36,
        r: Math.random() * 1.6 + 0.9,
      }));
      path = [];
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
      else for (const d of dots) if (d.y > h) d.y = Math.random() * h;
    }

    const near = (d: Dot) => mouse.on && (d.x - mouse.x) ** 2 + (d.y - mouse.y) ** 2 < MOUSE_RADIUS ** 2;

    function pickPath() {
      const start = Math.floor(Math.random() * dots.length);
      const chain = [start];
      while (chain.length < 5) {
        const a = dots[chain[chain.length - 1]];
        const nextIndex = dots.findIndex(
          (b, i) => !chain.includes(i) && (a.x - b.x) ** 2 + (a.y - b.y) ** 2 < LINK_DIST ** 2 && (a.x - b.x) ** 2 + (a.y - b.y) ** 2 > 1600,
        );
        if (nextIndex < 0) break;
        chain.push(nextIndex);
      }
      return chain.length > 1 ? chain : [];
    }

    function drawPulse(dt: number, hi: string) {
      if (!path.length) {
        rest -= dt;
        if (rest > 0) return;
        path = pickPath();
        elapsed = 0;
        rest = PULSE_REST;
        if (!path.length) return;
      }
      elapsed += dt;
      const seg = Math.floor(elapsed / PULSE_STEP);
      if (seg >= path.length - 1) {
        path = [];
        return;
      }
      const a = dots[path[seg]];
      const b = dots[path[seg + 1]];
      if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 > (LINK_DIST * 1.2) ** 2) {
        path = [];
        return;
      }
      const u = (elapsed % PULSE_STEP) / PULSE_STEP;
      const k = Math.min(u / 0.7, 1);
      const fade = Math.sin(Math.PI * u);
      const tail = Math.max(0, k - 0.25);
      const x = a.x + (b.x - a.x) * k;
      const y = a.y + (b.y - a.y) * k;
      ctx!.strokeStyle = `rgba(${hi}, ${0.75 * fade})`;
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.moveTo(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail);
      ctx!.lineTo(x, y);
      ctx!.stroke();
      ctx!.fillStyle = `rgba(${hi}, ${0.18 * fade})`;
      ctx!.beginPath();
      ctx!.arc(x, y, k === 1 ? 8 : 5, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = `rgba(${hi}, ${0.95 * fade})`;
      ctx!.beginPath();
      ctx!.arc(x, y, 2.3, 0, Math.PI * 2);
      ctx!.fill();
    }

    function frame(now: number, move: boolean) {
      const p = paletteRef.current || readPalette();
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      ctx!.clearRect(0, 0, w, h);

      if (move)
        for (const d of dots) {
          if (mouse.on) {
            const dx = mouse.x - d.x;
            const dy = mouse.y - d.y;
            const dist = Math.hypot(dx, dy);
            if (dist < MOUSE_RADIUS && dist > 0) {
              const f = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
              d.x -= (dx / dist) * f * 4;
              d.y -= (dy / dist) * f * 4;
            }
          }
          d.x += d.vx * (dt / 16);
          d.y += d.vy * (dt / 16);
          if (d.x < 0 || d.x > w) d.vx = -d.vx;
          if (d.y < 0 || d.y > h) d.vy = -d.vy;
          d.x = Math.max(-2, Math.min(w + 2, d.x));
          d.y = Math.max(-2, Math.min(h + 2, d.y));
        }

      const max = LINK_DIST * LINK_DIST;
      ctx!.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        const aNear = near(a);
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dsq = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
          if (dsq > max) continue;
          const strength = 1 - dsq / max;
          const lit = aNear || near(b);
          ctx!.strokeStyle = lit
            ? `rgba(${p.hi}, ${Math.min(1, strength * 0.95)})`
            : `rgba(${p.line}, ${strength * p.lineA})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }
      for (const d of dots) {
        const lit = near(d);
        ctx!.fillStyle = lit ? `rgba(${p.hi}, 0.95)` : `rgba(${p.dot}, ${p.dotA})`;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, lit ? d.r + 0.6 : d.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      if (move) drawPulse(dt, p.hi);
    }

    const loop = (now: number) => {
      frame(now, true);
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
      if (still || !raf) frame(performance.now(), false);
    };

    const onResize = () => {
      resize();
      if (still) frame(performance.now(), false);
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
    frame(performance.now(), false);
    start();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    if (fine && !still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    return () => {
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
