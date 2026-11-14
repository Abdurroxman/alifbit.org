import { useEffect, useRef, type CSSProperties } from "react";
import { LOGO } from "../../shared/logo";
import { observeVisibility } from "../lib/motion";

// Sahna 640×600. Belgi markazda S marta kattalashtirilgan.
const S = 2.45;
const MARK = `translate(${320 - 100 * S} ${300 - 112 * S}) scale(${S})`;
const ORBIT = { cx: 320, cy: 318, rx: 268, ry: 62, tilt: -9 };

const BITS: Array<{ x: number; y: number; s: number; tone: string; dur: number; from: string }> = [
  { x: 92, y: 132, s: 10, tone: "gold", dur: 7.5, from: "translate(-60px,-40px)" },
  { x: 548, y: 104, s: 8, tone: "green", dur: 9, from: "translate(50px,-50px)" },
  { x: 584, y: 412, s: 12, tone: "line", dur: 8.2, from: "translate(60px,30px)" },
  { x: 60, y: 450, s: 7, tone: "green", dur: 6.8, from: "translate(-50px,40px)" },
  { x: 470, y: 46, s: 6, tone: "gold", dur: 10, from: "translate(20px,-60px)" },
  { x: 168, y: 548, s: 8, tone: "line", dur: 7.9, from: "translate(-30px,50px)" },
];

function arc(front: boolean) {
  const { cx, cy, rx, ry } = ORBIT;
  return `M${cx - rx} ${cy} A${rx} ${ry} 0 0 ${front ? 0 : 1} ${cx + rx} ${cy}`;
}

function Piece({
  depth,
  dur,
  delay,
  from,
  className = "",
  children,
}: {
  depth: number;
  dur: number;
  delay: number;
  from: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <g className={`hs-piece ${className}`} data-depth={depth}>
      <g className="hs-float" style={{ "--dur": `${dur}s`, "--delay": `${delay}s` } as CSSProperties}>
        <g className="hs-assemble" style={{ "--from": from, "--ad": `${delay * 120}ms` } as CSSProperties}>
          {children}
        </g>
      </g>
    </g>
  );
}

function Arm({ d, fill }: { d: string; fill: string }) {
  return (
    <>
      <path d={d} transform="translate(2.2 3.2)" fill="#1c3829" />
      <path d={d} fill={fill} stroke={LOGO.colors.edge} strokeWidth=".9" strokeLinejoin="round" />
    </>
  );
}

function Bracket({ mirror }: { mirror?: boolean }) {
  const t = mirror ? "matrix(-1 0 0 1 200 0)" : undefined;
  return (
    <>
      <Piece depth={0.55} dur={8.4} delay={mirror ? 0.9 : 0.2} from={mirror ? "translate(150px,70px) rotate(14deg)" : "translate(-150px,70px) rotate(-14deg)"}>
        <g transform={MARK}>
          <g transform={t}>
            <Arm d={LOGO.lowerArm} fill="url(#hs-bottom)" />
          </g>
        </g>
      </Piece>
      <Piece depth={0.75} dur={7.2} delay={mirror ? 0.4 : 0} from={mirror ? "translate(150px,-80px) rotate(-14deg)" : "translate(-150px,-80px) rotate(14deg)"}>
        <g transform={MARK}>
          <g transform={t}>
            <Arm d={LOGO.upperArm} fill="url(#hs-top)" />
          </g>
        </g>
      </Piece>
    </>
  );
}

export default function HeroScene() {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = root.current;
    if (!svg || !document.documentElement.classList.contains("motion")) return;
    const pieces = Array.from(svg.querySelectorAll<SVGGElement>(".hs-piece"));
    const back = svg.querySelector<SVGGElement>(".hs-sphere-back");
    const front = svg.querySelector<SVGGElement>(".hs-sphere-front");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    let target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let angle = 2.2;
    let last = 0;
    let frame = 0;
    let running = false;

    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      angle += dt * 0.00042;
      const x = ORBIT.cx + Math.cos(angle) * ORBIT.rx;
      const y = ORBIT.cy + Math.sin(angle) * ORBIT.ry;
      const inFront = Math.sin(angle) > 0;
      const scale = 0.82 + (Math.sin(angle) + 1) * 0.16;
      const t = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      if (back && front) {
        back.style.transform = t;
        front.style.transform = t;
        back.style.opacity = inFront ? "0" : "1";
        front.style.opacity = inFront ? "1" : "0";
      }
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      for (const p of pieces) {
        const k = Number(p.dataset.depth || 0);
        p.style.transform = `translate(${(cur.x * k * 16).toFixed(2)}px, ${(cur.y * k * 12).toFixed(2)}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      svg.classList.remove("is-paused");
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
      svg.classList.add("is-paused");
    };
    const stopVisibility = observeVisibility(svg, (visible) => (visible ? start() : stop()));
    const move = (e: PointerEvent) => {
      target = {
        x: (e.clientX / innerWidth) * 2 - 1,
        y: (e.clientY / innerHeight) * 2 - 1,
      };
    };
    if (pointer) window.addEventListener("pointermove", move, { passive: true });
    return () => {
      stop();
      stopVisibility();
      window.removeEventListener("pointermove", move);
    };
  }, []);

  const c = LOGO.colors;
  return (
    <div className="hero-scene" data-reveal="scene" aria-hidden="true">
      <svg ref={root} viewBox="0 0 640 600" fill="none" className="hero-svg">
        <defs>
          <linearGradient id="hs-top" x1="80" y1="60" x2="10" y2="118" gradientUnits="userSpaceOnUse">
            <stop stopColor={c.armTop[0]} />
            <stop offset="1" stopColor={c.armTop[1]} />
          </linearGradient>
          <linearGradient id="hs-bottom" x1="10" y1="116" x2="80" y2="172" gradientUnits="userSpaceOnUse">
            <stop stopColor={c.armBottom[0]} />
            <stop offset="1" stopColor={c.armBottom[1]} />
          </linearGradient>
          <linearGradient id="hs-alif" x1="80" y1="30" x2="125" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor={c.alif[0]} />
            <stop offset=".42" stopColor={c.alif[1]} />
            <stop offset="1" stopColor={c.alif[2]} />
          </linearGradient>
          <radialGradient id="hs-sphere" cx=".35" cy=".3" r=".75">
            <stop stopColor="#f5e2b8" />
            <stop offset=".45" stopColor="#c6a066" />
            <stop offset="1" stopColor="#7d5f33" />
          </radialGradient>
          <radialGradient id="hs-floor" cx=".5" cy=".5" r=".5">
            <stop stopColor="#244534" stopOpacity=".2" />
            <stop offset="1" stopColor="#244534" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hs-glow" cx=".5" cy=".5" r=".5">
            <stop stopColor="#fff" stopOpacity=".9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="hs-backdrop">
          <circle cx="320" cy="300" r="250" fill="url(#hs-glow)" />
          <circle className="hs-guide" cx="320" cy="300" r="286" />
          <circle className="hs-guide hs-guide-dash" cx="320" cy="300" r="212" />
          <path className="hs-guide" d="M320 0V600M28 300H612" />
        </g>
        <ellipse cx="320" cy="548" rx="236" ry="22" fill="url(#hs-floor)" className="hs-floor" />

        <g transform={`rotate(${ORBIT.tilt} ${ORBIT.cx} ${ORBIT.cy})`}>
          <path className="hs-orbit hs-orbit-back" d={arc(false)} pathLength={1} />
          <g className="hs-sphere hs-sphere-back" transform="translate(162.5 368)">
            <circle r="13" fill="url(#hs-sphere)" />
          </g>
        </g>

        {BITS.map((b, i) => (
          <Piece key={i} depth={0.25 + (i % 3) * 0.2} dur={b.dur} delay={i * 0.35} from={b.from} className={`hs-bit hs-bit-${b.tone}`}>
            <rect x={b.x} y={b.y} width={b.s} height={b.s} rx="1.5" />
          </Piece>
        ))}

        <Bracket />
        <Bracket mirror />

        <Piece depth={1} dur={9} delay={0.6} from="translate(0px,120px) scale(.4,.1)" className="hs-alif">
          <g transform={MARK}>
            <path d={LOGO.alif} transform="translate(1.6 2.6)" fill="#7a5d33" />
            <path d={LOGO.alif} fill="url(#hs-alif)" stroke="#a7834b" strokeWidth=".6" />
          </g>
        </Piece>

        <g transform={`rotate(${ORBIT.tilt} ${ORBIT.cx} ${ORBIT.cy})`}>
          <path className="hs-orbit hs-orbit-front" d={arc(true)} pathLength={1} />
          <g className="hs-sphere hs-sphere-front" transform="translate(162.5 368)">
            <circle r="13" fill="url(#hs-sphere)" />
            <circle r="4" cx="-4" cy="-5" fill="#fff8e6" opacity=".55" />
          </g>
        </g>
      </svg>
    </div>
  );
}
